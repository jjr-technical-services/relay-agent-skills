#!/usr/bin/env python3
"""Measure objective style features across a corpus of writing samples.

Reads one or more JSONL sample files (schema in references/harvesting.md) and
reports per-register and overall measurements that a reader cannot estimate
reliably by eye: sentence-length distribution and variance, punctuation and
contraction rates, hedging, opener patterns, and how often the author actually
uses words commonly treated as AI tells.

Usage:
    python3 stylometrics.py ~/.codex/voice/profile-id/samples/*.jsonl --out metrics.json

Stdlib only, no network, Python 3.7+.

Keep it 3.7-compatible: no walrus operator, no statistics.fmean.
"""

from __future__ import annotations

import argparse
import json
import re
import statistics
import sys
import unicodedata
from collections import Counter
from pathlib import Path

# Words that a model reaches for by default. Measuring the author's real rate
# separates "ban this, it is not theirs" from "this is genuinely their word".
AI_TELLS = [
    "delve", "leverage", "robust", "seamless", "utilize", "furthermore",
    "moreover", "landscape", "realm", "tapestry", "testament", "crucial",
    "pivotal", "underscore", "holistic", "myriad", "plethora", "elevate",
    "unlock", "harness", "navigate", "foster", "bolster", "spearhead",
    "facilitate", "intricate", "nuanced", "multifaceted", "paradigm",
    "synergy", "streamline", "cutting-edge", "game-changer", "deep dive",
    "unpack", "align", "ecosystem", "journey", "empower", "transformative",
]

HEDGES = [
    "maybe", "perhaps", "might", "possibly", "probably", "arguably",
    "somewhat", "fairly", "relatively", "i think", "i believe", "i suspect",
    "sort of", "kind of", "a bit", "seems", "appears", "tends to",
]

INTENSIFIERS = [
    "very", "really", "quite", "extremely", "incredibly", "absolutely",
    "totally", "completely", "hugely", "massively", "super",
]

# Sentence-initial connectives. High rates read informal and spoken.
CONNECTIVES = ["but", "and", "so", "because", "which", "or", "yet", "still", "also"]

CONTRACTION_RE = re.compile(r"\b\w+['’](?:s|t|re|ve|ll|d|m)\b", re.IGNORECASE)
WORD_RE = re.compile(r"[^\W\d_]+(?:['’\-][^\W\d_]+)*", re.UNICODE)
# Split on terminal punctuation followed by whitespace, guarding common abbreviations.
ABBREV = r"(?<!\bMr)(?<!\bMrs)(?<!\bMs)(?<!\bDr)(?<!\bvs)(?<!\be\.g)(?<!\bi\.e)(?<!\betc)(?<!\bSt)(?<!\bJr)"
SENT_SPLIT_RE = re.compile(ABBREV + r"(?<=[.!?])[\"'”’)]*\s+")
BULLET_RE = re.compile(r"^\s*(?:[-*•–]|\d+[.)])\s+", re.MULTILINE)


def is_emoji(ch: str) -> bool:
    if ch in "#*0123456789":
        return False
    cp = ord(ch)
    return (
        0x1F300 <= cp <= 0x1FAFF
        or 0x2600 <= cp <= 0x27BF
        or 0x1F000 <= cp <= 0x1F2FF
        or cp in (0x2764, 0x2B50, 0x2705, 0x274C)
    )


def split_sentences(text: str) -> list[str]:
    # Treat hard line breaks as sentence boundaries too; chat and bullets often
    # omit terminal punctuation, and ignoring that inflates sentence length.
    chunks: list[str] = []
    for line in text.split("\n"):
        line = line.strip()
        if not line:
            continue
        chunks.extend(p.strip() for p in SENT_SPLIT_RE.split(line) if p.strip())
    return chunks


def split_paragraphs(text: str) -> list[str]:
    paras = re.split(r"\n\s*\n", text)
    return [p.strip() for p in paras if p.strip()]


def rate(count: int, words: int, per: int = 1000) -> float:
    return round(count * per / words, 2) if words else 0.0


def phrase_count(low: str, phrases: list[str]) -> int:
    total = 0
    for p in phrases:
        if " " in p:
            total += low.count(p)
        else:
            total += len(re.findall(rf"\b{re.escape(p)}\b", low))
    return total


def measure(samples: list[dict]) -> dict:
    """Compute measurements over one group of samples."""
    sent_lens: list[int] = []
    para_word_lens: list[int] = []
    para_sent_lens: list[int] = []
    sample_word_lens: list[int] = []
    word_lens: list[int] = []
    vocab: Counter = Counter()
    openers: Counter = Counter()
    tells: Counter = Counter()
    connective_starts: Counter = Counter()

    words_total = 0
    counts = Counter()

    for s in samples:
        text = s.get("text", "") or ""
        if not text.strip():
            continue

        words = WORD_RE.findall(text)
        n_words = len(words)
        if not n_words:
            continue
        words_total += n_words
        sample_word_lens.append(n_words)
        word_lens.extend(len(w) for w in words)
        low = text.lower()

        vocab.update(w.lower().strip("'’-") for w in words if len(w) > 3)

        sentences = split_sentences(text)
        for sent in sentences:
            sw = WORD_RE.findall(sent)
            if sw:
                sent_lens.append(len(sw))
                first = sw[0].lower()
                if first in CONNECTIVES:
                    connective_starts[first] += 1

        for para in split_paragraphs(text):
            pw = WORD_RE.findall(para)
            if pw:
                para_word_lens.append(len(pw))
                para_sent_lens.append(max(1, len(split_sentences(para))))

        if sentences:
            opener = " ".join(WORD_RE.findall(sentences[0])[:3]).lower()
            if opener:
                openers[opener] += 1

        counts["contractions"] += len(CONTRACTION_RE.findall(text))
        counts["em_dash"] += text.count("—")
        counts["spaced_hyphen"] += len(re.findall(r"\s-\s", text))
        counts["semicolon"] += text.count(";")
        counts["colon"] += text.count(":")
        counts["parenthetical"] += text.count("(")
        counts["question"] += text.count("?")
        counts["exclamation"] += text.count("!")
        counts["ellipsis"] += text.count("...") + text.count("…")
        counts["emoji"] += sum(1 for ch in text if is_emoji(ch))
        counts["bullets"] += len(BULLET_RE.findall(text))
        counts["hedges"] += phrase_count(low, HEDGES)
        counts["intensifiers"] += phrase_count(low, INTENSIFIERS)
        counts["i_pronoun"] += len(re.findall(r"\bi\b", low))
        counts["we_pronoun"] += len(re.findall(r"\bwe\b", low))
        counts["you_pronoun"] += len(re.findall(r"\byou\b", low))

        for tell in AI_TELLS:
            hits = low.count(tell) if " " in tell else len(re.findall(rf"\b{re.escape(tell)}\b", low))
            if hits:
                tells[tell] += hits

    if not sent_lens:
        return {"samples": len(samples), "words": 0, "note": "no measurable prose"}

    def dist(vals: list[int]) -> dict:
        vals = sorted(vals)
        return {
            "mean": round(statistics.mean(vals), 1),
            "median": statistics.median(vals),
            "stdev": round(statistics.pstdev(vals), 1) if len(vals) > 1 else 0.0,
            "p10": vals[int(len(vals) * 0.10)],
            "p90": vals[min(int(len(vals) * 0.90), len(vals) - 1)],
            "max": vals[-1],
        }

    short = sum(1 for n in sent_lens if n <= 5)
    long_ = sum(1 for n in sent_lens if n >= 30)

    return {
        "samples": len(samples),
        "words": words_total,
        "sentence_words": dist(sent_lens),
        # Variance matters more than the mean. A flat distribution reads robotic
        # regardless of where its average sits.
        "sentence_mix": {
            "very_short_pct": rate(short, len(sent_lens), 100),
            "very_long_pct": rate(long_, len(sent_lens), 100),
        },
        "paragraph_words": dist(para_word_lens) if para_word_lens else {},
        "paragraph_sentences": dist(para_sent_lens) if para_sent_lens else {},
        "sample_words": dist(sample_word_lens),
        "mean_word_length": round(statistics.mean(word_lens), 2),
        "vocabulary_diversity": round(len(vocab) / words_total, 3),
        "per_1000_words": {
            k: rate(v, words_total)
            for k, v in sorted(counts.items())
        },
        "pronoun_ratio_i_to_we": (
            round(counts["i_pronoun"] / counts["we_pronoun"], 2)
            if counts["we_pronoun"] else None
        ),
        "sentence_initial_connectives": {
            "per_1000_words": rate(sum(connective_starts.values()), words_total),
            "pct_of_sentences": rate(sum(connective_starts.values()), len(sent_lens), 100),
            "top": connective_starts.most_common(6),
        },
        "common_openers": openers.most_common(10),
        "frequent_words": [w for w, _ in vocab.most_common(40)],
        # Non-zero entries are the author's own words. Zero entries are safe to ban.
        "ai_tell_usage": dict(tells.most_common()),
        "ai_tells_never_used": [t for t in AI_TELLS if t not in tells],
    }


def load(paths: list[str]) -> list[dict]:
    samples: list[dict] = []
    for raw in paths:
        p = Path(raw).expanduser()
        if not p.exists():
            print(f"warning: {p} not found, skipping", file=sys.stderr)
            continue
        for i, line in enumerate(p.read_text(encoding="utf-8").splitlines(), 1):
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError as exc:
                print(f"warning: {p}:{i} invalid JSON ({exc}), skipping", file=sys.stderr)
                continue
            if not isinstance(obj, dict):
                print(f"warning: {p}:{i} is not a JSON object, skipping", file=sys.stderr)
                continue
            if obj.get("fragment"):
                continue
            raw_text = obj.get("text", "")
            if not isinstance(raw_text, str):
                print(f"warning: {p}:{i} text is not a string, skipping", file=sys.stderr)
                continue
            obj["text"] = unicodedata.normalize("NFC", raw_text)
            samples.append(obj)
    return samples


def main() -> int:
    ap = argparse.ArgumentParser(description="Measure style features across writing samples.")
    ap.add_argument("paths", nargs="+", help="JSONL sample files")
    ap.add_argument("--out", help="write JSON metrics here")
    ap.add_argument("--min-register", type=int, default=3,
                    help="minimum samples before a register is reported separately")
    args = ap.parse_args()

    samples = load(args.paths)
    if not samples:
        print("error: no samples loaded", file=sys.stderr)
        return 1

    by_register: dict[str, list[dict]] = {}
    for s in samples:
        by_register.setdefault(s.get("register", "unlabeled"), []).append(s)

    quarter_counts = Counter()
    for s in samples:
        d = str(s.get("date", ""))
        if len(d) >= 7:
            try:
                quarter_counts[f"{d[:4]}-Q{(int(d[5:7]) - 1) // 3 + 1}"] += 1
            except ValueError:
                pass

    result = {
        "corpus": {
            "total_samples": len(samples),
            "by_register": {k: len(v) for k, v in sorted(by_register.items())},
            "by_source": dict(Counter(s.get("source", "unknown") for s in samples)),
            "by_quarter": dict(sorted(quarter_counts.items())),
        },
        "overall": measure(samples),
        "by_register": {
            reg: measure(group)
            for reg, group in sorted(by_register.items())
            if len(group) >= args.min_register
        },
        "thin_registers": {
            reg: len(group) for reg, group in sorted(by_register.items())
            if len(group) < args.min_register
        },
    }

    text = json.dumps(result, indent=2, ensure_ascii=False)
    if args.out:
        out = Path(args.out).expanduser()
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(text + "\n", encoding="utf-8")
        c = result["corpus"]
        print(f"wrote {out}")
        print(f"  {c['total_samples']} samples across {len(c['by_register'])} registers")
        print(f"  registers: {c['by_register']}")
        if result["thin_registers"]:
            print(f"  too thin to report separately: {result['thin_registers']}")
    else:
        print(text)
    return 0


if __name__ == "__main__":
    sys.exit(main())
