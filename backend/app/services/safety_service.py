BLOCKED_TERMS = [
    "porn",
    "sexual",
    "suicide",
    "self harm",
    "weapon",
    "gun",
    "knife",
    "drug",
    "gambling",
]


def validate_child_safe_text(text: str) -> None:
    lower = text.lower()
    for term in BLOCKED_TERMS:
        if term in lower:
            raise ValueError("This topic is not suitable for the Digital Kids Assistant MVP.")
