from __future__ import annotations

import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

NS = {
    "main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "pkg": "http://schemas.openxmlformats.org/package/2006/relationships",
}

STOP_WORDS = {
    "and",
    "the",
    "for",
    "with",
    "all",
    "not",
    "see",
    "type",
    "types",
    "etc",
    "other",
    "than",
    "including",
    "products",
    "services",
    "service",
    "equipment",
    "supplies",
    "parts",
    "repair",
    "maintenance",
    "installation",
    "class",
    "used",
    "work",
}


def tokenize(text: str) -> list[str]:
    return [
        token
        for token in re.split(r"[^a-z0-9]+", text.lower())
        if token and token not in STOP_WORDS and len(token) > 2
    ]


def parse_xlsx_rows(path: Path) -> list[dict[str, str]]:
    with zipfile.ZipFile(path) as archive:
        shared: list[str] = []
        if "xl/sharedStrings.xml" in archive.namelist():
            root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            for si in root.findall("main:si", NS):
                shared.append("".join(t.text or "" for t in si.iterfind(".//main:t", NS)))

        workbook = ET.fromstring(archive.read("xl/workbook.xml"))
        relationships = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        relationship_map = {
            rel.attrib["Id"]: rel.attrib["Target"]
            for rel in relationships.findall("pkg:Relationship", NS)
        }
        sheet = workbook.find("main:sheets", NS)[0]
        target = "xl/" + relationship_map[
            sheet.attrib[
                "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
            ]
        ]
        root = ET.fromstring(archive.read(target))
        rows = root.findall(".//main:sheetData/main:row", NS)

        def column_name(reference: str) -> str:
            name = []
            for char in reference:
                if char.isalpha():
                    name.append(char)
                else:
                    break
            return "".join(name)

        parsed: list[dict[str, str]] = []
        for row in rows[1:]:
            values: dict[str, str] = {}
            for cell in row.findall("main:c", NS):
                ref = column_name(cell.attrib.get("r", ""))
                cell_type = cell.attrib.get("t")
                value_node = cell.find("main:v", NS)
                value = "" if value_node is None else value_node.text or ""
                if cell_type == "s" and value:
                    value = shared[int(value)]
                values[ref] = value.strip() if isinstance(value, str) else value
            parsed.append(values)
        return parsed


def build_records(rows: list[dict[str, str]]) -> list[dict[str, object]]:
    records: list[dict[str, object]] = []
    seen: set[str] = set()

    for values in rows:
        code = values.get("A", "").strip()
        title = values.get("B", "").strip()
        category = values.get("C", "").strip() or "General Services"
        keyword_field = values.get("D", "").strip()
        if not code or not title:
            continue

        record_id = "cat-nigp-" + re.sub(r"[^a-z0-9]+", "-", code.lower()).strip("-")
        if record_id in seen:
            continue
        seen.add(record_id)

        keywords: list[str] = []
        for part in (title, category):
            lowered = part.lower()
            if lowered and lowered not in keywords:
                keywords.append(lowered)
            for token in tokenize(part):
                if token not in keywords:
                    keywords.append(token)
        if keyword_field:
            keywords.append(keyword_field.lower())

        records.append(
            {
                "id": record_id,
                "sourceName": "WEBS",
                "code": code,
                "title": title,
                "description": f"NIGP commodity code for {title}. Category family: {category}.",
                "parentCode": code.split("-")[0] if "-" in code else None,
                "topLevelCategory": category,
                "normalizedKeywords": keywords[:18],
            }
        )

    return records


def write_typescript(records: list[dict[str, object]], out_path: Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    header = "// Generated from NIGP Commodity Codes.xlsx for The Bid Vault category search.\n"
    body = "export const nigpCommodityCodeRecords = " + json.dumps(records, indent=2) + " as const;\n"
    out_path.write_text(header + body, encoding="utf-8")


def main() -> int:
    if len(sys.argv) != 3:
        print("Usage: python scripts/import_nigp_codes.py <xlsx-path> <output-ts-path>")
        return 1

    xlsx_path = Path(sys.argv[1])
    out_path = Path(sys.argv[2])

    rows = parse_xlsx_rows(xlsx_path)
    records = build_records(rows)
    write_typescript(records, out_path)
    print(f"Wrote {len(records)} NIGP commodity code records to {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
