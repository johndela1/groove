#!/usr/bin/env python3

import sys
from collections import defaultdict

db = [
    ("1657377963135", "11011010", "240", "1", "6"),
    ("1657377963135", "11011010", "240", "0", "12"),
    ("1657377963135", "11011010", "240", "2", "6"),
    ("1657377963135", "11011010", "240", "4", "14"),
    ("1657377977584", "11011010", "240", "0", "-18"),
    ("1657377977584", "11011010", "240", "1", "-12"),
    ("1657377977584", "11011010", "240", "2", "5"),
    ("1657377977584", "11011010", "240", "3", "5"),
]

db = [tuple(l.rstrip().split(" ")) for l in sys.stdin]

def extract_errors(db):
    errs_with_order = defaultdict(list)
    for id_, _, _, order, err in db:
        errs_with_order[id_].append((int(order), int(err)))

    return [
        (id_, [err for _, err in sorted(errs)])
        for id_, errs in errs_with_order.items()
    ]


for id_, errs in extract_errors(db):
    print(id_, errs, sum(abs(e) for e in errs))
