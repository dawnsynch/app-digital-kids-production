from html import escape

import streamlit as st


def render_helper_text(text: str) -> None:
    st.markdown(f"<div class='dk-helper'>{escape(text)}</div>", unsafe_allow_html=True)


def render_page_header(title: str, subtitle: str) -> None:
    st.markdown(
        "<div class='dk-page-header'>"
        f"<div class='dk-page-title'>{escape(title)}</div>"
        f"<div class='dk-page-copy'>{escape(subtitle)}</div>"
        "</div>",
        unsafe_allow_html=True,
    )


def render_portal_card_start() -> None:
    st.markdown("<div class='portal-card'>", unsafe_allow_html=True)


def render_portal_card_end() -> None:
    st.markdown("</div>", unsafe_allow_html=True)


def render_stat_cards(items: list[tuple[str, str]]) -> None:
    html = []
    for label, value in items:
        html.append(
            "<div class='dk-stat-card'>"
            f"<div class='dk-stat-label'>{escape(label)}</div>"
            f"<div class='dk-stat-value'>{escape(value)}</div>"
            "</div>"
        )
    st.markdown(f"<div class='dk-stats-grid'>{''.join(html)}</div>", unsafe_allow_html=True)


def render_quick_action_card(title: str, body: str, icon: str) -> str:
    return (
        "<div class='dk-quick-action'>"
        f"<div class='dk-card-title'>{escape(icon)} {escape(title)}</div>"
        f"<div class='dk-quick-copy'>{escape(body)}</div>"
        "</div>"
    )


def render_section_header(title: str, body: str | None = None, eyebrow: str | None = None) -> None:
    eyebrow_html = f"<div class='dk-section-eyebrow'>{escape(eyebrow)}</div>" if eyebrow else ""
    body_html = f"<div class='dk-section-copy'>{escape(body)}</div>" if body else ""
    st.markdown(
        "<div class='dk-section'>"
        f"{eyebrow_html}"
        f"<div class='dk-section-title'>{escape(title)}</div>"
        f"{body_html}"
        "</div>",
        unsafe_allow_html=True,
    )


def render_info_card(title: str, body: str, icon: str = "✨") -> None:
    st.markdown(
        "<div class='dk-card dk-info-card'>"
        f"<div class='dk-card-title'>{escape(icon)} {escape(title)}</div>"
        f"<div>{escape(body)}</div>"
        "</div>",
        unsafe_allow_html=True,
    )


def render_feature_card(title: str, body: str, icon: str, tag: str | None = None) -> None:
    tag_html = f"<div class='dk-tag'>{escape(tag)}</div>" if tag else ""
    st.markdown(
        "<div class='dk-card dk-feature-card'>"
        f"{tag_html}"
        f"<div class='dk-card-title'>{escape(icon)} {escape(title)}</div>"
        f"<div class='dk-card-body'>{escape(body)}</div>"
        "</div>",
        unsafe_allow_html=True,
    )


def render_metric_card(label: str, value: str, icon: str = "📊") -> str:
    return (
        "<div class='dk-card dk-metric-card'>"
        f"<div class='dk-card-title'>{escape(icon)} {escape(label)}</div>"
        f"<div class='dk-big-number'>{escape(value)}</div>"
        "</div>"
    )


def render_metric_cards_grid(items: list[tuple[str, str, str]]) -> None:
    cards = [render_metric_card(label=label, value=value, icon=icon) for icon, label, value in items]
    st.markdown(f"<div class='dk-grid'>{''.join(cards)}</div>", unsafe_allow_html=True)


def render_timeline_step(title: str, body: str) -> None:
    st.markdown(
        "<div class='dk-step'>"
        f"<div class='dk-step-title'>{escape(title)}</div>"
        f"<div class='dk-step-body'>{escape(body)}</div>"
        "</div>",
        unsafe_allow_html=True,
    )


def render_preview_card() -> None:
    st.markdown(
        """
        <div class='dk-preview'>
            <div class='dk-preview-head'>Family Learning Snapshot</div>
            <div class='dk-preview-row'>
                <div>
                    <div class='dk-preview-label'>Parent Dashboard</div>
                    <div class='dk-preview-value'>Action Plan Ready</div>
                </div>
                <div class='dk-tag'>Weekly overview</div>
            </div>
            <div class='dk-preview-row'>
                <div>
                    <div class='dk-preview-label'>Learner Progress</div>
                    <div class='dk-preview-value'>3 activities completed</div>
                </div>
                <div class='dk-tag'>Growing well</div>
            </div>
            <div class='dk-preview-row'>
                <div>
                    <div class='dk-preview-label'>Today's Activity</div>
                    <div class='dk-preview-value'>Fractions + Creative sketch</div>
                </div>
                <div class='dk-tag'>Balanced learning</div>
            </div>
            <div class='dk-preview-row'>
                <div>
                    <div class='dk-preview-label'>Next Recommended Step</div>
                    <div class='dk-preview-value'>Review weak area and encourage</div>
                </div>
                <div class='dk-tag'>Parent guided</div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def render_hero(title: str, body: str, eyebrow: str, trust_line: str) -> None:
    st.markdown(
        "<div class='dk-hero'>"
        f"<div class='dk-eyebrow'>{escape(eyebrow)}</div>"
        f"<h1>{escape(title)}</h1>"
        f"<div class='dk-hero-copy'>{escape(body)}</div>"
        f"<div class='dk-trust'>{escape(trust_line)}</div>"
        "</div>",
        unsafe_allow_html=True,
    )


def render_pilot_cta(title: str, body: str) -> None:
    st.markdown(
        "<div class='dk-card dk-cta-card'>"
        f"<div class='dk-section-title'>{escape(title)}</div>"
        f"<div class='dk-section-copy'>{escape(body)}</div>"
        "</div>",
        unsafe_allow_html=True,
    )


def render_status_card(title: str, body: str, tone: str = "info", icon: str = "✨") -> None:
    st.markdown(
        f"<div class='dk-status-card dk-status-{escape(tone)}'>"
        f"<div class='dk-card-title'>{escape(icon)} {escape(title)}</div>"
        f"<div class='dk-card-body'>{escape(body)}</div>"
        "</div>",
        unsafe_allow_html=True,
    )


def render_panel(title: str, body: str, icon: str = "✨", accent: str | None = None) -> None:
    accent_class = f" {escape(accent)}" if accent else ""
    st.markdown(
        f"<div class='dk-dashboard-panel{accent_class}'>"
        f"<div class='dk-panel-title'>{escape(icon)} {escape(title)}</div>"
        f"<div class='dk-panel-copy'>{escape(body)}</div>"
        "</div>",
        unsafe_allow_html=True,
    )


def render_journey_rows(rows: list[dict]) -> None:
    if not rows:
        return
    html_rows = []
    for row in rows:
        html_rows.append(
            "<div class='dk-journey-row'>"
            "<div>"
            f"<div class='dk-journey-title'>{escape(str(row.get('title', '')))}</div>"
            f"<div class='dk-journey-meta'>{escape(str(row.get('meta', '')))}</div>"
            "</div>"
            f"<div class='dk-tag'>{escape(str(row.get('tag', '')))}</div>"
            "</div>"
        )
    st.markdown(f"<div class='dk-dashboard-panel'>{''.join(html_rows)}</div>", unsafe_allow_html=True)


def render_list_card(title: str, items: list[str], icon: str = "✨", empty_message: str | None = None) -> None:
    if not items:
        render_panel(title, empty_message or "Nothing listed yet.", icon)
        return
    rows = "".join(
        f"<div class='dk-list-row'><span>{escape(str(index + 1))}.</span><span>{escape(str(item))}</span></div>"
        for index, item in enumerate(items)
    )
    st.markdown(
        "<div class='dk-dashboard-panel'>"
        f"<div class='dk-panel-title'>{escape(icon)} {escape(title)}</div>"
        f"{rows}"
        "</div>",
        unsafe_allow_html=True,
    )
