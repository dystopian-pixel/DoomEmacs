#!/usr/bin/env python3
"""
Split each sheet (tab) from an Excel workbook into separate CSV files.
If given a plain CSV (which has no sheets), it will just copy it.

Usage:
  python split_tabs_to_csv.py /path/to/input.xlsx
  python split_tabs_to_csv.py /path/to/input.xlsx -o ./out --no-index
  python split_tabs_to_csv.py /path/to/input.csv -o ./out
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path
import shutil

def safe_sheet_to_filename(name: str, maxlen: int = 80) -> str:
    # Replace anything not alphanumeric/underscore/hyphen with underscore
    cleaned = re.sub(r"[^\w\-]+", "_", name, flags=re.UNICODE).strip("_")
    if not cleaned:
        cleaned = "sheet"
    return cleaned[:maxlen]

def unique_path(base: Path) -> Path:
    """Return a non-clobbering path by adding _2, _3, ... if needed."""
    if not base.exists():
        return base
    stem, suffix = base.stem, base.suffix
    i = 2
    while True:
        candidate = base.with_name(f"{stem}_{i}{suffix}")
        if not candidate.exists():
            return candidate
        i += 1

def split_excel_to_csv(
    in_path: Path,
    out_dir: Path,
    index: bool,
    encoding: str,
    include: str | None,
    exclude: str | None,
    overwrite: bool,
) -> int:
    try:
        import pandas as pd
    except ImportError:
        print(
            "Error: This feature requires pandas (and openpyxl for .xlsx). "
            "Install them with:\n  pip install pandas openpyxl",
            file=sys.stderr,
        )
        return 1

    try:
        # Use openpyxl for modern Excel formats
        xls = pd.ExcelFile(in_path, engine="openpyxl")
    except Exception as e:
        print(f"Failed to open workbook: {e}", file=sys.stderr)
        return 1

    inc_re = re.compile(include) if include else None
    exc_re = re.compile(exclude) if exclude else None

    out_dir.mkdir(parents=True, exist_ok=True)

    written = 0
    for sheet in xls.sheet_names:
        if inc_re and not inc_re.search(sheet):
            continue
        if exc_re and exc_re.search(sheet):
            continue

        try:
            df = pd.read_excel(xls, sheet_name=sheet)
        except Exception as e:
            print(f"Skipping sheet '{sheet}' due to read error: {e}", file=sys.stderr)
            continue

        base_name = f"{in_path.stem}__{safe_sheet_to_filename(sheet)}.csv"
        out_path = out_dir / base_name
        if out_path.exists() and not overwrite:
            out_path = unique_path(out_path)

        try:
            df.to_csv(out_path, index=index, encoding=encoding)
            print(f"Wrote: {out_path}")
            written += 1
        except Exception as e:
            print(f"Failed to write '{out_path}': {e}", file=sys.stderr)

    if written == 0:
        print("No sheets written (check include/exclude patterns?).", file=sys.stderr)
        return 2
    return 0

def handle_plain_csv(
    in_path: Path,
    out_dir: Path,
    overwrite: bool,
) -> int:
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{in_path.stem}__single.csv"
    if out_path.exists() and not overwrite:
        out_path = unique_path(out_path)
    try:
        shutil.copy2(in_path, out_path)
        print(
            "Input is a plain CSV (no sheets). Copied to:\n"
            f"  {out_path}"
        )
        return 0
    except Exception as e:
        print(f"Failed to copy CSV: {e}", file=sys.stderr)
        return 1

def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(
        description="Export each sheet in an Excel file to its own CSV. "
                    "If input is a CSV, just copy it (since CSV has no sheets)."
    )
    p.add_argument("input", type=Path, help="Path to .xlsx/.xlsm (preferred) or .csv")
    p.add_argument(
        "-o", "--outdir", type=Path, default=None,
        help="Output directory (default: alongside the input file in a new folder)"
    )
    p.add_argument(
        "--encoding", default="utf-8-sig",
        help="CSV encoding (default: utf-8-sig, friendly for Excel)"
    )
    p.add_argument(
        "--no-index", action="store_true",
        help="Do not include the DataFrame index column in CSV output"
    )
    p.add_argument(
        "--include", default=None,
        help="Regex to include only matching sheet names"
    )
    p.add_argument(
        "--exclude", default=None,
        help="Regex to exclude matching sheet names"
    )
    p.add_argument(
        "--overwrite", action="store_true",
        help="Overwrite existing files (otherwise add numeric suffixes)"
    )

    args = p.parse_args(argv)

    in_path: Path = args.input
    if not in_path.exists() or not in_path.is_file():
        print(f"Input file not found: {in_path}", file=sys.stderr)
        return 1

    out_dir = args.outdir
    if out_dir is None:
        out_dir = in_path.parent / f"{in_path.stem}__csvs"

    ext = in_path.suffix.lower()

    if ext in {".xlsx", ".xlsm"}:
        return split_excel_to_csv(
            in_path=in_path,
            out_dir=out_dir,
            index=not args.no_index,
            encoding=args.encoding,
            include=args.include,
            exclude=args.exclude,
            overwrite=args.overwrite,
        )
    elif ext == ".csv":
        return handle_plain_csv(
            in_path=in_path,
            out_dir=out_dir,
            overwrite=args.overwrite,
        )
    else:
        print(
            "Unsupported file type. Please provide an Excel workbook (.xlsx/.xlsm) "
            "or a CSV (.csv).",
            file=sys.stderr,
        )
        return 1

if __name__ == "__main__":
    raise SystemExit(main())
