import os
from pathlib import Path

import requests
import streamlit as st

try:
    from frontend.styles import apply_global_styles
    from frontend.ui_components import (
        render_feature_card,
        render_helper_text,
        render_hero,
        render_info_card,
        render_journey_rows,
        render_list_card,
        render_metric_cards_grid,
        render_page_header,
        render_panel,
        render_portal_card_end,
        render_portal_card_start,
        render_pilot_cta,
        render_preview_card,
        render_section_header,
        render_stat_cards,
        render_status_card,
        render_timeline_step,
    )
except ModuleNotFoundError:
    from styles import apply_global_styles
    from ui_components import (
        render_feature_card,
        render_helper_text,
        render_hero,
        render_info_card,
        render_journey_rows,
        render_list_card,
        render_metric_cards_grid,
        render_page_header,
        render_panel,
        render_portal_card_end,
        render_portal_card_start,
        render_pilot_cta,
        render_preview_card,
        render_section_header,
        render_stat_cards,
        render_status_card,
        render_timeline_step,
    )

API_BASE_URL = os.getenv("API_BASE_URL") or os.getenv("PUBLIC_API_URL") or "http://localhost:8000"
APP_ROOT = Path(__file__).resolve().parents[1]
AUTH_IMAGE_CANDIDATES = [
    APP_ROOT / "marketing-site" / "assets" / "images" / "hero_banner.png",
    APP_ROOT / "marketing-site" / "assets" / "images" / "journey.png",
    APP_ROOT / "marketing-site" / "assets" / "images" / "parent_involvement.png",
]
st.set_page_config(page_title="Digital Kids Assistant", page_icon="📘", layout="wide", initial_sidebar_state="expanded")
apply_global_styles()


def auth_headers() -> dict[str, str]:
    token = st.session_state.get("access_token")
    return {"Authorization": f"Bearer {token}"} if token else {}


def api_error(exc: Exception) -> str:
    if isinstance(exc, requests.HTTPError):
        try:
            detail = exc.response.json().get("detail")
            return detail if isinstance(detail, str) else str(detail)
        except Exception:
            return exc.response.text
    return str(exc)


def api_get(path: str, protected: bool = True, params: dict | None = None):
    response = requests.get(
        f"{API_BASE_URL}{path}",
        headers=auth_headers() if protected else None,
        params={key: value for key, value in (params or {}).items() if value not in (None, "", "All")},
        timeout=60,
    )
    response.raise_for_status()
    return response.json()


def api_post(path: str, payload: dict, protected: bool = True):
    response = requests.post(
        f"{API_BASE_URL}{path}",
        json=payload,
        headers=auth_headers() if protected else None,
        timeout=180,
    )
    response.raise_for_status()
    return response.json()


def load_backend_health() -> tuple[dict | None, str | None]:
    try:
        return api_get("/health", protected=False), None
    except Exception as exc:
        return None, api_error(exc)


MODULE_LABELS = {
    "coding_ai": "Coding / AI",
    "spiritual_guide": "Spiritual Guide",
    "hobbies_creativity": "Hobbies & Creativity",
}


def record_learning_interaction(
    student_id: int,
    module_name: str,
    category: str,
    topic: str,
    title: str,
    content: dict,
    assignment: dict,
) -> None:
    try:
        api_post(
            "/learning-interactions",
            {
                "student_id": student_id,
                "module_name": module_name,
                "category": category,
                "topic": topic,
                "title": title,
                "content_json": content,
                "assignment_json": assignment,
                "status": "generated",
            },
        )
    except Exception as exc:
        st.warning(f"Activity was generated, but tracking was not saved: {api_error(exc)}")


helper_text = render_helper_text
info_card = render_info_card
mini_metric_cards = render_metric_cards_grid
landing_card = render_feature_card
timeline_step = render_timeline_step
preview_card = render_preview_card


def render_items(title: str, items: list[str], icon: str) -> None:
    st.write(f"**{icon} {title}**")
    if not items:
        render_panel(title, "Generate and review a learning activity to see this section.", icon)
        return
    st.table([{title.rstrip("s"): item} for item in items])


def _priority_for_index(index: int) -> str:
    if index == 0:
        return "High"
    if index in (1, 2):
        return "Medium"
    return "Low"


def build_weak_area_rows(
    items: list[str],
    subject_or_module: str = "Revision",
    topic: str = "General",
    suggested_action: str = "Review the skill and practice again.",
) -> list[dict]:
    rows = []
    for index, item in enumerate(items):
        rows.append(
            {
                "Subject / Module": subject_or_module,
                "Topic": topic,
                "Weak Area": item,
                "Suggested Action": suggested_action,
                "Priority": _priority_for_index(index),
            }
        )
    return rows


def build_recommendation_rows(items: list[str]) -> list[dict]:
    rows = []
    for index, item in enumerate(items):
        rows.append(
            {
                "Recommendation": item,
                "Reason": "This follows from the learner's recent learning journey.",
                "Suggested Practice": "Use a short focused follow-up activity as the recommended next step.",
                "Priority": _priority_for_index(index),
            }
        )
    return rows


def build_progress_summary_rows(
    learner_name: str,
    grade: str,
    revision_attempts: list[dict],
    interactions: list[dict],
    average_score: str,
    recommended_next_step: str,
) -> list[dict]:
    rows = []
    if revision_attempts:
        subject_groups: dict[tuple[str, str], list[dict]] = {}
        for attempt in revision_attempts:
            key = (attempt.get("subject", "Revision"), attempt.get("topic", "General"))
            subject_groups.setdefault(key, []).append(attempt)
        for (subject, attempt_topic), attempts in subject_groups.items():
            last_attempt = attempts[0]
            scored = [a.get("percentage") for a in attempts if a.get("percentage") is not None]
            avg = f"{round(sum(scored) / len(scored), 1)}%" if scored else ""
            rows.append(
                {
                    "Learner": learner_name,
                    "Grade": grade,
                    "Module": subject,
                    "Topic / Activity": attempt_topic,
                    "Attempts / Activities": len(attempts),
                    "Average Score if applicable": avg or average_score,
                    "Last Activity": last_attempt.get("date", ""),
                    "Recommended Next Step": recommended_next_step,
                }
            )
    for item in interactions:
        rows.append(
            {
                "Learner": learner_name,
                "Grade": grade,
                "Module": MODULE_LABELS.get(item.get("module_name"), item.get("module_name", "Activity")),
                "Topic / Activity": item.get("title") or item.get("topic") or item.get("category") or "Activity",
                "Attempts / Activities": 1,
                "Average Score if applicable": "",
                "Last Activity": item.get("created_at", ""),
                "Recommended Next Step": recommended_next_step,
            }
        )
    return rows


def render_polished_table(title: str, rows: list[dict], empty_message: str, icon: str = "📊") -> None:
    st.write(f"**{icon} {title}**")
    if not rows:
        render_panel(title, empty_message, icon)
        return
    st.dataframe(rows, use_container_width=True, hide_index=True)


def render_progress_summary(summary: dict) -> None:
    mini_metric_cards(
        [
            ("📚", "Revision attempts", str(summary.get("attempts_count", 0))),
            ("🎨", "Learning activities", str(summary.get("learning_interactions_count", 0))),
            ("⭐", "Subjects tracked", str(len(summary.get("subject_average_percentages", {})))),
            ("🎯", "Weak areas", str(len(summary.get("recent_weak_areas", [])))),
        ]
    )

    subject_scores = summary.get("subject_average_percentages", {})
    if subject_scores:
        render_polished_table(
            "Subject averages",
            [
                {"Subject": subject, "Average %": percentage}
                for subject, percentage in subject_scores.items()
            ],
            "Marked assessments will appear here as subject averages.",
            "📊",
        )
    else:
        info_card("No subject scores yet", "Marked assessments will appear here as subject averages.", "📊")

    weak_areas = summary.get("recent_weak_areas", [])
    render_polished_table(
        "Weak Areas",
        build_weak_area_rows(
            weak_areas,
            subject_or_module="Revision",
            topic="Family summary",
            suggested_action="Review this area together and generate focused revision.",
        ),
        "Generate and review a learning activity to see weak areas here.",
        "🎯",
    )

    module_counts = summary.get("learning_module_counts", {})
    if module_counts:
        render_polished_table(
            "Learning activity totals",
            [
                {"Module": MODULE_LABELS.get(module, module), "Activities": count}
                for module, count in module_counts.items()
            ],
            "Learning activity totals will appear here.",
            "🎨",
        )

    render_learning_interactions(summary.get("recent_learning_interactions", []), "Recent learning activities")
    render_polished_table(
        "Progress Summary",
        build_progress_summary_rows(
            learner_name="Family",
            grade="Mixed",
            revision_attempts=[],
            interactions=summary.get("recent_learning_interactions", []),
            average_score="",
            recommended_next_step="Review recent activity and choose the next focused support step.",
        ),
        "Progress summary rows will appear here as activity is tracked.",
        "📈",
    )


def render_learning_interactions(interactions: list[dict], title: str = "Learning activities") -> None:
    st.write(f"**🎨 {title}**")
    if not interactions:
        render_panel("No learning activities yet", "Generate Coding, Values, or Hobbies activities to see them here.", "🌱")
        return

    rows = []
    for item in interactions:
        rows.append(
            {
                "Date": item.get("created_at", ""),
                "Module": MODULE_LABELS.get(item.get("module_name"), item.get("module_name", "")),
                "Category": item.get("category") or "",
                "Topic": item.get("topic") or "",
                "Title": item.get("title") or "",
                "Status": item.get("status") or "",
            }
        )
    st.dataframe(rows, use_container_width=True, hide_index=True)


def run_api_action(label: str, progress_text: str, action):
    status_box = st.empty()
    progress = st.progress(0, text=progress_text)
    try:
        status_box.info(label)
        progress.progress(35, text=progress_text)
        with st.spinner(label):
            result = action()
        progress.progress(100, text="Done")
        status_box.success("Done")
        return result
    finally:
        progress.empty()


def set_auth(data: dict) -> None:
    st.session_state["access_token"] = data["access_token"]
    st.session_state["user"] = data["user"]


def clear_auth() -> None:
    for key in list(st.session_state.keys()):
        del st.session_state[key]


def navigate_to(page: str) -> None:
    st.session_state["pending_menu_selection"] = page
    st.rerun()


def validate_login_input(identifier: str, password: str, login_type: str) -> str | None:
    label = "email" if login_type == "Parent email" else "username"
    if not identifier.strip():
        return f"Enter your {label} to continue."
    if not password.strip():
        return "Enter your password to continue."
    return None


def validate_parent_signup(full_name: str, email: str, password: str) -> str | None:
    if not full_name.strip():
        return "Enter the parent's full name."
    if not email.strip():
        return "Enter the parent email address."
    if "@" not in email or "." not in email.split("@")[-1]:
        return "Enter a valid email address."
    if not password.strip():
        return "Create a password for the parent account."
    if len(password) < 6:
        return "Use a password with at least 6 characters."
    return None


def resolve_existing_asset(paths: list[Path]) -> str | None:
    for path in paths:
        if path.exists():
            return str(path)
    return None


def brand_logo_path() -> str | None:
    return str(BRAND_LOGO) if BRAND_LOGO.exists() else None


def _file_to_base64(path: str | None) -> str:
    if not path:
        return ""
    return base64.b64encode(Path(path).read_bytes()).decode("utf-8")


def load_students() -> list[dict]:
    try:
        return api_get("/students")
    except Exception as exc:
        st.error(f"Could not load learners: {api_error(exc)}")
        return []


def selected_student(students: list[dict]) -> dict | None:
    user = st.session_state["user"]
    if user["role"] == "learner":
        return students[0] if students else None
    if not students:
        st.info("Create a learner profile first.")
        return None
    labels = {f"{s['name']} - Grade {s['grade']}": s for s in students}
    selected = st.selectbox("Select learner", list(labels.keys()))
    return labels[selected]


def show_auth_screen() -> None:
    health, health_error = load_backend_health()

    hero_image = resolve_existing_asset(AUTH_IMAGE_CANDIDATES)

    st.markdown("<div class='dk-entry-shell'>", unsafe_allow_html=True)
    if health:
        ai_mode_label = "OpenAI" if health.get("ai_mode") == "openai" else "Mock AI"
        st.markdown(
            "<div class='dk-status-pill'><span class='dk-status-dot'></span>"
            f"<span>Backend connected</span><span style='opacity:0.72;font-weight:700;'>AI: {ai_mode_label}</span></div>",
            unsafe_allow_html=True,
        )
    elif health_error:
        render_status_card("Backend not connected", health_error, tone="warning", icon="🟡")

    st.markdown("<div class='dk-main-shell'>", unsafe_allow_html=True)

    welcome_col, visual_col = st.columns([1.05, 0.95], gap="large")
    with welcome_col:
        st.markdown(
            """
            <div class='dk-brand-bar'>
                <div>
                    <div class='dk-brand-title'>Digital Kids Assistant</div>
                    <div class='dk-brand-tagline'>Learning for school. Skills for life.</div>
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )
        st.markdown(
            """
            <div class='dk-welcome-card'>
                <div class='dk-welcome-eyebrow'>Welcome</div>
                <div class='dk-welcome-title'>Continue your child’s learning journey</div>
                <div class='dk-welcome-copy'>
                    Create a parent account or sign in to access revision, coding, creativity, and progress support in
                    one safe learning space.
                </div>
                <div class='dk-benefit-pills'>
                    <span class='dk-benefit-pill'>CBC Revision</span>
                    <span class='dk-benefit-pill'>Coding &amp; AI</span>
                    <span class='dk-benefit-pill'>Creativity</span>
                    <span class='dk-benefit-pill'>Progress Tracking</span>
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with visual_col:
        st.markdown("<div class='dk-image-frame'>", unsafe_allow_html=True)
        if hero_image:
            st.image(hero_image, use_container_width=True)
        else:
            render_panel("Welcome image unavailable", "The sign-in experience will continue without the preview image.", "🖼️")
        st.markdown("</div>", unsafe_allow_html=True)
        st.markdown(
            """
            <div class='dk-mini-note'>
                <div class='dk-mini-note-title'>Safe parent-guided learning</div>
                Enter a family learning space built for revision, creativity, and steady progress at home.
            </div>
            <div class='dk-mini-note'>
                <div class='dk-mini-note-title'>Track progress with confidence</div>
                Parents stay close to the journey while learners grow through guided practice and skill-building.
            </div>
            """,
            unsafe_allow_html=True,
        )

    auth_cols = st.columns([0.12, 0.76, 0.12], gap="small")
    with auth_cols[1]:
        st.markdown(
            """
            <div class='dk-auth-card'>
                <div class='dk-auth-title'>Continue securely</div>
                <div class='dk-auth-copy'>
                    Sign in or create an account to enter the learning assistant.
                </div>
            """,
            unsafe_allow_html=True,
        )

        login_tab, signup_tab = st.tabs(["Login", "Create Account"])

        with login_tab:
            parent_login_tab, learner_login_tab = st.tabs(["Parent Login", "Learner Login"])

            with parent_login_tab:
                with st.form("parent_login_form"):
                    parent_email = st.text_input("Email address", key="parent_login_email")
                    parent_password = st.text_input("Password", type="password", key="parent_login_password")
                    submitted = st.form_submit_button("Login as Parent", use_container_width=True)
                    if submitted:
                        validation_error = validate_login_input(parent_email, parent_password, "Parent email")
                        if validation_error:
                            render_status_card("Check your details", validation_error, tone="warning", icon="📝")
                        else:
                            try:
                                set_auth(
                                    api_post(
                                        "/auth/login",
                                        {"email": parent_email.strip(), "password": parent_password},
                                        protected=False,
                                    )
                                )
                                render_status_card("Login successful", "Taking you to your learning space now.", tone="success", icon="✅")
                                st.rerun()
                            except Exception as exc:
                                render_status_card("Login failed", api_error(exc), tone="error", icon="⚠️")

            with learner_login_tab:
                st.caption("Learner accounts are created by a parent.")
                with st.form("learner_login_form"):
                    learner_username = st.text_input("Username", key="learner_login_username")
                    learner_password = st.text_input("Password", type="password", key="learner_login_password")
                    submitted = st.form_submit_button("Login as Learner", use_container_width=True)
                    if submitted:
                        validation_error = validate_login_input(learner_username, learner_password, "Learner username")
                        if validation_error:
                            render_status_card("Check your details", validation_error, tone="warning", icon="📝")
                        else:
                            try:
                                set_auth(
                                    api_post(
                                        "/auth/login",
                                        {"username": learner_username.strip(), "password": learner_password},
                                        protected=False,
                                    )
                                )
                                render_status_card("Login successful", "Taking you to your learning space now.", tone="success", icon="✅")
                                st.rerun()
                            except Exception as exc:
                                render_status_card("Login failed", api_error(exc), tone="error", icon="⚠️")
            st.caption("Forgot password support can be added next. Learner accounts are created by a parent.")

        with signup_tab:
            with st.form("signup_form"):
                full_name = st.text_input("Parent/Guardian name")
                email = st.text_input("Email address")
                phone_number = st.text_input("Phone number")
                child_grade = st.selectbox("Child grade", ["Grade 5", "Grade 6", "Grade 7"])
                password = st.text_input("Password", type="password")
                st.caption("Phone number and child grade support onboarding in the app. Parent account signup uses name, email, and password.")
                submitted = st.form_submit_button("Create account", use_container_width=True)
                if submitted:
                    validation_error = validate_parent_signup(full_name, email, password)
                    if validation_error:
                        render_status_card("Check your details", validation_error, tone="warning", icon="📝")
                    else:
                        st.session_state["signup_profile"] = {
                            "phone_number": phone_number.strip(),
                            "child_grade": child_grade,
                        }
                        try:
                            set_auth(
                                api_post(
                                    "/auth/register-parent",
                                    {"full_name": full_name.strip(), "email": email.strip(), "password": password},
                                    protected=False,
                                )
                            )
                            render_status_card("Account created", "Your parent account is ready. Redirecting to your dashboard.", tone="success", icon="🎉")
                            st.rerun()
                        except Exception as exc:
                            render_status_card("Sign up failed", api_error(exc), tone="error", icon="⚠️")

        st.markdown(
            "<div class='dk-trust-note'>Built for safe, parent-guided learning at home.</div></div>",
            unsafe_allow_html=True,
        )
    st.markdown("</div>", unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)


def show_sidebar() -> str:
    user = st.session_state["user"]
    pending_menu_selection = st.session_state.pop("pending_menu_selection", None)
    if pending_menu_selection:
        st.session_state["menu_selection"] = pending_menu_selection
    with st.sidebar:
        st.markdown(
            "<div class='sidebar-profile-card'>"
            f"<div class='sidebar-name'>{user['full_name']}</div>"
            f"<div class='sidebar-role'>{user['role'].title()}</div>"
            "</div>",
            unsafe_allow_html=True,
        )
        if st.button("Log out"):
            clear_auth()
            st.rerun()
        health, health_error = load_backend_health()
        if health:
            ai_mode_label = "OpenAI" if health.get("ai_mode") == "openai" else "Mock AI"
            st.markdown(
                f"<div class='sidebar-status'>Backend healthy: {health['status']} · AI: {ai_mode_label}</div>",
                unsafe_allow_html=True,
            )
        elif health_error:
            st.warning(f"Backend not connected: {health_error}")

        if "menu_selection" not in st.session_state:
            if user["role"] == "admin":
                st.session_state["menu_selection"] = "🛠️ Admin Dashboard"
            elif user["role"] == "parent":
                st.session_state["menu_selection"] = "👨‍👩‍👧 Dashboard"
            else:
                st.session_state["menu_selection"] = "🏠 My Home"

        if user["role"] == "admin":
            return st.radio(
                "Menu",
                [
                    "🛠️ Admin Dashboard",
                    "👨‍👩‍👧 Parents",
                    "👧 Learners",
                    "📊 Progress",
                    "📝 Assessments",
                    "🎯 Module Interactions",
                    "📈 Platform Summary",
                ],
                key="menu_selection",
            )
        if user["role"] == "parent":
            return st.radio(
                "Menu",
                [
                    "👨‍👩‍👧 Dashboard",
                    "👧 My Children",
                    "📘 Generate Revision",
                    "✅ Mark Answers",
                    "💻 Coding & AI",
                    "🙏 Values / Bible Lessons",
                    "🎨 Hobbies & Creativity",
                    "📊 Progress",
                ],
                key="menu_selection",
            )
        return st.radio(
            "Menu",
            ["🏠 My Home", "📘 My Revision", "💻 Coding & AI Fun", "🙏 Bible Lessons", "🎨 Hobbies & Creativity", "📊 My Progress"],
            key="menu_selection",
        )


def _admin_user_options(users: list[dict], label: str) -> int | None:
    labels = ["All"] + [f"{user['full_name']} ({user.get('email') or user.get('username')}) - ID {user['id']}" for user in users]
    selected = st.selectbox(label, labels)
    if selected == "All":
        return None
    return users[labels.index(selected) - 1]["id"]


def _admin_filters(include_module: bool = False, include_subject: bool = False) -> dict:
    try:
        parents = api_get("/admin/parents")
        learners = api_get("/admin/learners")
    except Exception as exc:
        st.error(f"Could not load admin filters: {api_error(exc)}")
        return {}

    col1, col2, col3 = st.columns(3)
    with col1:
        parent_id = _admin_user_options(parents, "Filter by parent")
    with col2:
        learner_id = _admin_user_options(learners, "Filter by learner")
    with col3:
        grade = st.selectbox("Filter by grade", ["All", 5, 6, 7])

    params = {"parent_id": parent_id, "learner_id": learner_id, "grade": grade}
    col4, col5, col6 = st.columns(3)
    with col4:
        if include_module:
            params["module"] = st.selectbox(
                "Filter by module",
                ["All", "coding_ai", "spiritual_guide", "hobbies_creativity"],
            )
        elif include_subject:
            params["subject"] = st.text_input("Filter by subject")
    with col5:
        date_from = st.date_input("From date", value=None)
        params["date_from"] = date_from.isoformat() if date_from else None
    with col6:
        date_to = st.date_input("To date", value=None)
        params["date_to"] = date_to.isoformat() if date_to else None
    return params


def render_quick_launch(section_title: str, actions: list[tuple[str, str, str]]) -> None:
    render_section_header(section_title)
    icon_map = {
        "Generate Revision": "📘",
        "Mark Answers": "✅",
        "Coding & AI": "💻",
        "Hobbies": "🎨",
        "Progress": "📊",
        "My Revision": "📘",
        "Coding & AI Fun": "💻",
        "Bible Lessons": "🙏",
        "Hobbies & Creativity": "🎨",
        "My Progress": "📊",
    }
    st.markdown("<div class='quick-launch-wrap'>", unsafe_allow_html=True)
    cols = st.columns(len(actions), gap="medium")
    for col, (label, page, help_text) in zip(cols, actions):
        with col:
            icon = icon_map.get(label, "✨")
            st.markdown(
                f"""
                <div class="quick-card">
                    <div>
                        <div class="quick-icon">{icon}</div>
                        <div class="quick-title">{label}</div>
                        <div class="quick-description">{help_text}</div>
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )
            if st.button(label, use_container_width=True, help=help_text, key=f"launch_{page}_{label}"):
                navigate_to(page)
    st.markdown("</div>", unsafe_allow_html=True)


def student_summary_recommendation(progress: dict) -> str:
    weak_areas = progress.get("recent_weak_areas") or []
    interactions = progress.get("learning_interactions") or []
    recent_attempts = progress.get("recent_attempts") or []
    if weak_areas:
        return f"Focus next on {weak_areas[0]} with a fresh revision activity and a short review together."
    if recent_attempts:
        return "Keep the revision rhythm going with one more short practice set and parent encouragement."
    if interactions:
        return "Balance the next session with a revision task so school practice and life skills stay connected."
    return "Start with a short revision or creativity activity to build momentum today."


def render_recent_activity_panel(interactions: list[dict], attempts: list[dict], empty_message: str) -> None:
    rows = []
    for item in (attempts or [])[:3]:
        rows.append(
            {
                "title": f"{item.get('subject', 'Revision')} - {item.get('topic', 'Practice')}",
                "meta": f"{item.get('date', '')} | Score: {'' if item.get('percentage') is None else str(item.get('percentage')) + '%'}",
                "tag": "Revision",
            }
        )
    for item in (interactions or [])[:3]:
        rows.append(
            {
                "title": item.get("title") or item.get("topic") or "Learning activity",
                "meta": f"{item.get('created_at', '')} | {MODULE_LABELS.get(item.get('module_name'), item.get('module_name', 'Activity'))}",
                "tag": item.get("status") or "Generated",
            }
        )
    if rows:
        render_journey_rows(rows[:5])
    else:
        render_panel("No recent activity yet", empty_message, "🌱")


def learning_rows_by_module(interactions: list[dict], module_name: str) -> list[dict]:
    return [
        {
            "Date": item.get("created_at", ""),
            "Category": item.get("category") or "",
            "Topic": item.get("topic") or "",
            "Title": item.get("title") or "",
            "Status": item.get("status") or "",
        }
        for item in interactions
        if item.get("module_name") == module_name
    ]


def render_admin_dashboard() -> None:
    st.header("🛠️ Admin Dashboard")
    helper_text("Here is the platform pilot overview.")
    try:
        summary = run_api_action("Loading admin dashboard...", "Collecting platform summary", lambda: api_get("/admin/summary"))
        health = api_get("/health", protected=False)
        mini_metric_cards(
            [
                ("👨‍👩‍👧", "Parents", str(summary["parents"])),
                ("👧", "Learners", str(summary["learners"])),
                ("📝", "Assessments", str(summary["assessments"])),
                ("🎯", "Interactions", str(summary["learning_interactions"])),
            ]
        )
        panel_col1, panel_col2 = st.columns(2, gap="large")
        with panel_col1:
            render_panel(
                "Platform health summary",
                (
                    f"Backend status: {health.get('status', 'unknown')}. "
                    f"{summary['parents']} parent accounts, {summary['learners']} learner accounts, "
                    f"and {summary['learning_interactions']} tracked whole-child learning activities are active in the pilot."
                ),
                "🩺",
                accent="dk-recommendation",
            )
        with panel_col2:
            render_panel(
                "Recent platform activity",
                "Latest assessments and module interactions across the pilot group.",
                "📡",
            )

        recent_assessments = api_get("/admin/assessments", params={"date_to": None})[:3]
        recent_interactions = api_get("/admin/interactions", params={"date_to": None})[:3]
        render_recent_activity_panel(
            interactions=recent_interactions,
            attempts=[
                {
                    "subject": item.get("subject"),
                    "topic": item.get("topic"),
                    "date": item.get("created_at"),
                    "percentage": item.get("percentage"),
                }
                for item in recent_assessments
            ],
            empty_message="Platform activity will appear here as parents and learners use the pilot.",
        )
    except Exception as exc:
        st.error(f"Could not load admin dashboard: {api_error(exc)}")


def render_admin_parents() -> None:
    st.header("👨‍👩‍👧 Parents")
    helper_text("Parent accounts. Password hashes are never returned or displayed.")
    try:
        rows = run_api_action("Loading parents...", "Fetching parent accounts", lambda: api_get("/admin/parents"))
        st.dataframe(rows, use_container_width=True, hide_index=True)
    except Exception as exc:
        st.error(f"Could not load parents: {api_error(exc)}")


def render_admin_learners() -> None:
    st.header("👧 Learners")
    helper_text("Learner accounts and student profiles across the platform.")
    try:
        parents = api_get("/admin/parents")
        parent_id = _admin_user_options(parents, "Filter learner accounts by parent")
        learners = run_api_action(
            "Loading learners...",
            "Fetching learner accounts",
            lambda: api_get("/admin/learners", params={"parent_id": parent_id}),
        )
        st.write("**Learner accounts**")
        st.dataframe(learners, use_container_width=True, hide_index=True)
        students = api_get("/admin/students", params={"parent_id": parent_id})
        st.write("**Student profiles**")
        st.dataframe(students, use_container_width=True, hide_index=True)
    except Exception as exc:
        st.error(f"Could not load learners: {api_error(exc)}")


def render_admin_progress() -> None:
    st.header("📊 Progress")
    helper_text("Revision and module activity progress across learners.")
    params = _admin_filters()
    if st.button("Load admin progress"):
        try:
            rows = run_api_action("Loading progress...", "Summarizing learner progress", lambda: api_get("/admin/progress", params=params))
            st.dataframe(rows, use_container_width=True, hide_index=True)
        except Exception as exc:
            st.error(f"Could not load admin progress: {api_error(exc)}")


def render_admin_assessments() -> None:
    st.header("📝 Assessments")
    helper_text("Revision activity across the platform pilot.")
    params = _admin_filters(include_subject=True)
    if st.button("Load assessments"):
        try:
            rows = run_api_action("Loading assessments...", "Fetching revision assessments", lambda: api_get("/admin/assessments", params=params))
            st.dataframe(rows, use_container_width=True, hide_index=True)
        except Exception as exc:
            st.error(f"Could not load assessments: {api_error(exc)}")


def render_admin_interactions() -> None:
    st.header("🎯 Module Interactions")
    helper_text("Coding, values, and creativity interactions across learners.")
    params = _admin_filters(include_module=True)
    if st.button("Load module interactions"):
        try:
            rows = run_api_action("Loading interactions...", "Fetching module interactions", lambda: api_get("/admin/interactions", params=params))
            display_rows = [
                {
                    "id": row.get("id"),
                    "student": row.get("student_name"),
                    "parent": row.get("parent_name"),
                    "grade": row.get("grade"),
                    "module": MODULE_LABELS.get(row.get("module_name"), row.get("module_name")),
                    "category": row.get("category"),
                    "topic": row.get("topic"),
                    "title": row.get("title"),
                    "status": row.get("status"),
                    "created_at": row.get("created_at"),
                }
                for row in rows
            ]
            st.dataframe(display_rows, use_container_width=True, hide_index=True)
        except Exception as exc:
            st.error(f"Could not load interactions: {api_error(exc)}")


def render_admin_summary() -> None:
    st.header("📈 Platform Summary")
    helper_text("High-level platform totals and whole-child learning activity distribution.")
    try:
        summary = run_api_action("Loading platform summary...", "Preparing platform totals", lambda: api_get("/admin/summary"))
        mini_metric_cards(
            [
                ("👨‍👩‍👧", "Parents", str(summary["parents"])),
                ("👧", "Learners", str(summary["learners"])),
                ("🛠️", "Admins", str(summary["admins"])),
                ("🧒", "Students", str(summary["students"])),
                ("📝", "Assessments", str(summary["assessments"])),
                ("🎯", "Interactions", str(summary["learning_interactions"])),
            ]
        )
        if summary.get("module_counts"):
            st.write("**Module counts**")
            st.table([{"Module": MODULE_LABELS.get(k, k), "Count": v} for k, v in summary["module_counts"].items()])
        if summary.get("subject_counts"):
            st.write("**Subject counts**")
            st.table([{"Subject": k, "Count": v} for k, v in summary["subject_counts"].items()])
    except Exception as exc:
        st.error(f"Could not load platform summary: {api_error(exc)}")


def render_dashboard(students: list[dict]) -> None:
    render_page_header(
        "Parent Dashboard",
        "Manage your child’s revision, coding, creativity, values learning, and progress in one place.",
    )
    learner = selected_student(students)
    if learner:
        options = {f"{student['name']} (Grade {student['grade']})": student for student in students}
        selected_label = st.selectbox("Child selector", list(options.keys()), index=list(options.values()).index(learner))
        learner = options[selected_label]

    try:
        summary = run_api_action(
            "Loading dashboard...",
            "Gathering family learning progress",
            lambda: api_get("/progress/summary"),
        )
        student_progress = api_get(f"/progress/student/{learner['id']}") if learner else None
        user_name = st.session_state["user"]["full_name"].split()[0]
        render_portal_card_start()
        render_page_header(
            f"Welcome back, {user_name}",
            f"Manage {learner['name'] if learner else 'your learners'} with a calm, parent-guided dashboard.",
        )
        render_stat_cards(
            [
                ("Learners", str(len(students))),
                ("Recent activities", str((student_progress or {}).get("attempts_count", 0) + len((student_progress or {}).get("learning_interactions", [])))),
                ("Average score", "Not marked yet" if not student_progress or student_progress.get("average_percentage") is None else f"{student_progress['average_percentage']}%"),
                ("Parent guided", "Active"),
            ]
        )
        render_portal_card_end()
        panel_col1, panel_col2 = st.columns(2, gap="large")
        with panel_col1:
            render_panel(
                "Recommended next action",
                student_summary_recommendation(student_progress or {}),
                "➡️",
                accent="dk-recommendation",
            )
        with panel_col2:
            render_panel(
                "Child focus",
                (
                    f"{learner['name']} is in Grade {learner['grade']}. "
                    f"Use quick launch below to support learning for school, skills for life, and whole-child growth."
                ) if learner else "Create a learner profile to start a parent-guided learning journey.",
                "🧭",
            )

        render_portal_card_start()
        render_quick_launch(
            "Quick launch",
            [
                ("Generate Revision", "📘 Generate Revision", "Open revision generation"),
                ("Mark Answers", "✅ Mark Answers", "Review and mark submitted work"),
                ("Coding & AI", "💻 Coding & AI", "Generate a coding lesson"),
                ("Hobbies", "🎨 Hobbies & Creativity", "Open creativity activities"),
                ("Progress", "📊 Progress", "Open the progress dashboard"),
            ],
        )
        render_portal_card_end()

        recent_cols = st.columns(2, gap="large")
        with recent_cols[0]:
            render_section_header("Today's activity")
            render_recent_activity_panel(
                interactions=(student_progress or {}).get("learning_interactions", []),
                attempts=(student_progress or {}).get("recent_attempts", []),
                empty_message="Today's activity and recent learning moments will show here.",
            )
        with recent_cols[1]:
            render_section_header("Weak areas")
            weak_areas = (student_progress or {}).get("recent_weak_areas", []) or summary.get("recent_weak_areas", [])
            if weak_areas:
                st.table([{"Focus area": item} for item in weak_areas])
            else:
                render_panel("No weak areas yet", "Marked revision will surface support areas here.", "🌟")
    except Exception as exc:
        mini_metric_cards([("🧒", "Learners", str(len(students))), ("📝", "Revision attempts", "0")])
        st.warning(f"Learning journey summary unavailable: {api_error(exc)}")


def render_learners(students: list[dict]) -> None:
    render_page_header(
        "Manage Learners",
        "Create learner profiles and give each child a safe parent-guided login.",
    )
    col1, col2 = st.columns([1, 2])

    with col1:
        render_portal_card_start()
        st.subheader("Create learner")
        with st.form("create_student"):
            name = st.text_input("Learner name")
            grade = st.selectbox("Grade", [5, 6, 7])
            age_group = st.text_input("Age group", placeholder="Example: 10-12")
            submitted = st.form_submit_button("Save learner")
            if submitted:
                try:
                    run_api_action(
                        "Creating learner...",
                        "Saving learner profile",
                        lambda: api_post("/students", {"name": name, "grade": grade, "age_group": age_group or None}),
                    )
                    st.success("Learner created 🎉")
                    st.rerun()
                except Exception as exc:
                    st.error(f"Could not create learner: {api_error(exc)}")

        st.subheader("Create learner login")
        learner = selected_student(students)
        if learner:
            with st.form("create_learner_login"):
                full_name = st.text_input("Display name", value=learner["name"])
                username = st.text_input("Username")
                password = st.text_input("Password", type="password")
                submitted = st.form_submit_button("Create login")
                if submitted:
                    try:
                        run_api_action(
                            "Creating learner login...",
                            "Setting up a safe learner account",
                            lambda: api_post(
                                f"/students/{learner['id']}/learner-account",
                                {"full_name": full_name, "username": username, "password": password},
                            ),
                        )
                        st.success("Learner login created")
                    except Exception as exc:
                        st.error(f"Could not create learner login: {api_error(exc)}")
        render_portal_card_end()

    with col2:
        render_portal_card_start()
        st.subheader("Your learners")
        if students:
            st.dataframe(students, use_container_width=True, hide_index=True)
        else:
            st.info("No learners yet.")
        render_portal_card_end()


def render_revision(students: list[dict]) -> None:
    user = st.session_state["user"]
    st.header("📝 My Revision" if user["role"] == "learner" else "📝 Generate Revision Questions")
    helper_text("Choose the school focus for today and generate a short, age-friendly activity for learning for school, skills for life.")
    learner = selected_student(students)
    if not learner:
        return

    health, _ = load_backend_health()
    if health and health.get("ai_mode") == "mock":
        mock_reason = health.get("mock_reason") or "Mock AI mode is enabled."
        render_status_card(
            "Mock AI mode is active",
            f"Revision generation is currently using fallback sample questions. {mock_reason}. Restart the backend without USE_MOCK_AI=true to use OpenAI.",
            tone="warning",
            icon="⚠️",
        )

    try:
        options = api_get("/revision/options")
    except Exception as exc:
        st.error(f"Could not load revision options: {api_error(exc)}")
        return

    subjects = options["subjects"].get(str(learner["grade"]), [])
    render_status_card(
        "Revision setup",
        f"{learner['name']} is working at Grade {learner['grade']}. Pick the subject, topic, and number of questions to build today's activity.",
        tone="info",
        icon="📘",
    )
    with st.form("generate_revision"):
        term = st.selectbox("Term", [1, 2, 3])
        subject = st.selectbox("Subject", subjects)
        topic = st.text_input("Topic", value="General Revision", help="Use a specific topic when the child needs focused practice.")
        difficulty = st.selectbox("Difficulty", ["Easy", "Medium", "Hard"], index=1)
        question_count = st.slider("Number of questions", 1, 10, 5)
        submitted = st.form_submit_button("Generate revision questions", use_container_width=True)

    if submitted:
        try:
            data = run_api_action(
                "Generating revision questions...",
                "Preparing fresh practice questions",
                lambda: api_post(
                    "/revision/generate",
                    {
                        "student_id": learner["id"],
                        "term": term,
                        "subject": subject,
                        "topic": topic,
                        "difficulty": difficulty,
                        "question_count": question_count,
                    },
                ),
            )
            st.session_state["latest_assessment"] = data
            st.success(f"Today's activity is ready. Assessment {data['assessment_id']} has been created 🎉")
        except Exception as exc:
            st.error(f"Could not generate revision: {api_error(exc)}")

    assessment = st.session_state.get("latest_assessment")
    if assessment:
        render_section_header(
            "Generated Questions",
            body=f"Assessment ID {assessment['assessment_id']} is ready. Work through each question as part of today's learning journey.",
        )
        mini_metric_cards(
            [
                ("📘", "Subject", assessment.get("subject", subject)),
                ("🧠", "Topic", assessment.get("topic", topic)),
                ("❓", "Questions", str(len(assessment["questions"]))),
            ]
        )
        if user["role"] == "learner":
            answers = []
            with st.form(f"submit_learner_answers_{assessment['assessment_id']}"):
                for q in assessment["questions"]:
                    with st.container(border=True):
                        st.markdown(f"**Q{q['id']}. {q['question']}**")
                        pill_col1, pill_col2 = st.columns(2)
                        with pill_col1:
                            st.caption(f"Marks: {q['marks']}")
                        with pill_col2:
                            st.caption(f"Skill tested: {q['skill_tested']}")
                        answer = st.text_area(
                            "My answer",
                            key=f"learner_answer_{assessment['assessment_id']}_{q['id']}",
                            placeholder="Type your answer here...",
                        )
                        answers.append({"question_id": q["id"], "answer": answer})
                submitted_answers = st.form_submit_button("Send my answers for review", use_container_width=True)

            if submitted_answers:
                try:
                    run_api_action(
                        "Submitting answers...",
                        "Saving your answers",
                        lambda: api_post(
                            "/revision/answers",
                            {"assessment_id": assessment["assessment_id"], "answers": answers},
                        ),
                    )
                    st.success("Your Parent will review and mark this for you.")
                except Exception as exc:
                    st.error(f"Could not submit answers: {api_error(exc)}")
        else:
            for q in assessment["questions"]:
                with st.container(border=True):
                    st.markdown(f"**Q{q['id']}. {q['question']}**")
                    st.caption(f"Marks: {q['marks']} | Skill tested: {q['skill_tested']}")
                    st.info("Share this question with the learner, then come back to Marking when answers are ready.")


def render_marking(students: list[dict]) -> None:
    st.header("✅ Enter Learner Answers and Mark")
    helper_text("Load the learner's revision, check the answers, and review progress in one parent-guided screen.")
    render_status_card(
        "Assessment lookup",
        "Choose a learner, then pick one of their recent assessments. You can still enter an assessment ID manually if needed.",
        tone="info",
        icon="📝",
    )

    learner = selected_student(students)
    recent_attempts: list[dict] = []
    if learner:
        try:
            learner_progress = run_api_action(
                "Loading learner assessments...",
                "Finding recent revision work",
                lambda: api_get(f"/progress/student/{learner['id']}"),
            )
            recent_attempts = learner_progress.get("recent_attempts", [])
        except Exception as exc:
            st.warning(f"Could not load recent assessments: {api_error(exc)}")

    answered_attempts = [item for item in recent_attempts if item.get("has_answers") or item.get("is_marked")]

    if learner and answered_attempts:
        render_section_header(
            "Submitted learner assessments",
            body=f"Use one of {learner['name']}'s submitted assessments below. Only work with learner answers appears here.",
        )
        assessment_rows = []
        for item in answered_attempts:
            assessment_rows.append(
                {
                    "Assessment ID": item["assessment_id"],
                    "Subject": item["subject"],
                    "Topic": item["topic"],
                    "Date": item["date"],
                    "Status": "Marked" if item.get("is_marked") else "Submitted by learner",
                }
            )
        st.dataframe(assessment_rows, use_container_width=True, hide_index=True)

        attempt_options = {
            f"Assessment {item['assessment_id']} · {item['subject']} · {item['topic']}": item["assessment_id"]
            for item in answered_attempts
        }
        selected_attempt_label = st.selectbox(
            "Choose submitted assessment",
            list(attempt_options.keys()),
            key="marking_assessment_selector",
        )
        selected_attempt_id = attempt_options[selected_attempt_label]
        quick_col, manual_col = st.columns([1.1, 0.9], gap="large")
        with quick_col:
            if st.button("Load selected assessment", use_container_width=True):
                try:
                    st.session_state["assessment_to_mark"] = run_api_action(
                        "Loading assessment...",
                        "Finding questions and submitted answers",
                        lambda: api_get(f"/revision/{selected_attempt_id}"),
                    )
                except Exception as exc:
                    st.error(f"Could not load assessment: {api_error(exc)}")
        with manual_col:
            st.caption(f"Selected assessment ID: {selected_attempt_id}")
    else:
        render_panel(
            "No submitted learner answers found",
            "Ask the learner to complete and submit revision first. You can still enter an assessment ID manually below if needed.",
            "📘",
        )

    manual_assessment_id = st.number_input("Assessment ID", min_value=1, step=1, key="manual_assessment_id")
    if st.button("Load assessment by ID", use_container_width=True):
        try:
            st.session_state["assessment_to_mark"] = run_api_action(
                "Loading assessment...",
                "Finding questions and submitted answers",
                lambda: api_get(f"/revision/{manual_assessment_id}"),
            )
        except Exception as exc:
            st.error(f"Could not load assessment: {api_error(exc)}")

    assessment = st.session_state.get("assessment_to_mark")
    if assessment:
        render_section_header(
            "Assessment summary",
            body=f"{assessment['subject']} | {assessment['topic']}",
        )
        mini_metric_cards(
            [
                ("📘", "Subject", assessment["subject"]),
                ("🧠", "Topic", assessment["topic"]),
                ("❓", "Questions", str(len(assessment["questions"]))),
            ]
        )
        if assessment.get("answers"):
            render_status_card(
                "Learner answers loaded",
                "This assessment already contains the learner's submitted answers. Review them below and mark when ready.",
                tone="success",
                icon="🧒",
            )
        else:
            render_status_card(
                "No learner answers found yet",
                "This assessment was generated, but the learner has not submitted answers yet. Wait for the learner submission before marking.",
                tone="warning",
                icon="⚠️",
            )
        saved_answers = {
            item["question_id"]: item.get("answer", "")
            for item in (assessment.get("answers") or [])
        }
        answers = []
        with st.form("submit_answers"):
            for q in assessment["questions"]:
                with st.container(border=True):
                    st.markdown(f"**Q{q['id']}. {q['question']}**")
                    st.caption(f"Marks: {q['marks']} | Skill tested: {q['skill_tested']}")
                    answer = st.text_area(
                        f"Learner answer for Q{q['id']}",
                        value=saved_answers.get(q["id"], ""),
                        key=f"answer_{assessment['assessment_id']}_{q['id']}",
                        placeholder="Enter or review the learner's answer here...",
                    )
                    answers.append({"question_id": q["id"], "answer": answer})
            submitted = st.form_submit_button("Mark answers", use_container_width=True)

        if submitted:
            try:
                result = run_api_action(
                    "Marking answers...",
                    "Checking answers and preparing feedback",
                    lambda: api_post(
                        "/revision/submit",
                        {"assessment_id": assessment["assessment_id"], "answers": answers},
                    ),
                )
                st.session_state["latest_result"] = result
                st.success("Marked successfully 🎉")
            except Exception as exc:
                st.error(f"Could not mark assessment: {api_error(exc)}")

    result = st.session_state.get("latest_result")
    if result:
        render_section_header("Marking Result", body="Use this result to encourage the learner and choose the next support step.")
        mini_metric_cards(
            [
                ("🏆", "Score", f"{result['score']} / {result['total_marks']}"),
                ("📈", "Percentage", f"{result['percentage']}%"),
                ("❓", "Questions", str(len(result["marked_questions"]))),
            ]
        )
        render_panel("Overall feedback", result["overall_feedback"], "🌟", accent="dk-recommendation")
        strengths = [
            {
                "Question": item["question_id"],
                "Marks": f"{item['marks_awarded']} / {item['total_marks']}",
                "Strength": "Strong response"
                if item["marks_awarded"] == item["total_marks"]
                else "Partial understanding",
            }
            for item in result["marked_questions"]
            if item["marks_awarded"] > 0
        ]
        col1, col2 = st.columns(2)
        with col1:
            st.write("**💪 Strengths**")
            if strengths:
                st.table(strengths)
            else:
                render_panel("Strengths", "Strengths will appear as the learner grows through practice.", "💪")
        with col2:
            render_polished_table(
                "Weak Areas",
                build_weak_area_rows(
                    result["weak_areas"],
                    subject_or_module="Revision",
                    topic="Latest marked assessment",
                    suggested_action="Target this skill with guided practice as the recommended next step.",
                ),
                "No weak areas were identified in this attempt.",
                "🎯",
            )

        render_polished_table(
            "Recommendations",
            build_recommendation_rows(result["recommendations"]),
            "No extra recommendations were returned for this assessment.",
            "🚀",
        )

        next_action = result["recommendations"][0] if result["recommendations"] else "Celebrate this result and choose the next short learning activity when ready."
        render_panel("Next action", next_action, "➡️", accent="dk-recommendation")

        st.write("**Question feedback**")
        feedback_rows = [
            {
                "Question": item["question_id"],
                "Marks": f"{item['marks_awarded']} / {item['total_marks']}",
                "Feedback": item["feedback"],
            }
            for item in result["marked_questions"]
        ]
        st.table(feedback_rows)


def render_coding(students: list[dict]) -> None:
    st.header("💻 Coding / AI Lesson")
    helper_text("Build a short digital skills activity that supports whole-child growth beyond revision.")
    learner = selected_student(students)
    grade = learner["grade"] if learner and st.session_state["user"]["role"] == "learner" else st.selectbox("Grade", [5, 6, 7])
    topic = st.selectbox(
        "Topic",
        [
            "What is a computer?",
            "What is an algorithm?",
            "Introduction to Scratch-style block coding",
            "What is Artificial Intelligence?",
            "Internet safety basics",
            "Typing and file management",
        ],
    )
    custom_topic = st.text_input("Or enter custom topic", placeholder="Example: What is a variable?")
    minutes = st.slider("Lesson minutes", 5, 45, 20)
    render_status_card(
        "Lesson setup",
        "Choose a ready topic or enter your own, then generate today's activity for coding and AI learning.",
        tone="info",
        icon="💻",
    )
    if st.button("Generate lesson"):
        selected_topic = custom_topic.strip() or topic
        try:
            lesson = run_api_action(
                "Generating coding lesson...",
                "Building a fun technology lesson",
                lambda: api_post(
                    "/learning/coding",
                    {"grade": grade, "topic": selected_topic, "lesson_minutes": minutes},
                ),
            )
            st.session_state["coding_lesson"] = lesson
            if learner:
                record_learning_interaction(
                    student_id=learner["id"],
                    module_name="coding_ai",
                    category="Coding / AI Lesson",
                    topic=selected_topic,
                    title=lesson["title"],
                    content=lesson,
                    assignment={"grade": grade, "topic": selected_topic, "lesson_minutes": minutes},
                )
            st.success("Coding lesson is ready 🚀")
            st.session_state["coding_assignment"] = {"grade": grade, "topic": selected_topic, "lesson_minutes": minutes}
        except Exception as exc:
            st.error(f"Could not generate lesson: {api_error(exc)}")

    lesson = st.session_state.get("coding_lesson")
    if lesson:
        assignment = st.session_state.get("coding_assignment", {})
        render_section_header("Coding / AI Lesson", body=lesson["title"])
        top_col1, top_col2 = st.columns(2, gap="large")
        with top_col1:
            info_card("Topic", assignment.get("topic", lesson["title"]), "🧠")
        with top_col2:
            info_card(
                "Assignment",
                f"Grade {assignment.get('grade', grade)} | {assignment.get('lesson_minutes', minutes)} minutes",
                "📝",
            )
        info_card("Explanation", lesson["explanation"], "💡")
        info_card("Activity", lesson["activity"], "🛠️")
        info_card("Real-life example", lesson["real_life_example"], "🌍")
        render_list_card("Quiz", lesson["quiz"], "❓", "No quiz questions yet.")
        info_card("Parent note", lesson["parent_notes"], "🤝")
        render_status_card("Interaction tracking", "This activity is being tracked in your child's learning journey.", tone="success", icon="📈")


def render_spiritual(students: list[dict]) -> None:
    st.header("🙏 Spiritual Guide")
    helper_text("Create a calm, child-friendly values activity with a short story, questions, activity, and prayer.")
    learner = selected_student(students)
    grade = learner["grade"] if learner and st.session_state["user"]["role"] == "learner" else st.selectbox("Grade", [5, 6, 7])
    theme = st.selectbox(
        "Theme",
        [
            "Peace when worried",
            "Courage at school",
            "Obedience and respect",
            "Kindness to others",
            "Wisdom in choices",
            "Thankfulness",
        ],
    )
    custom_theme = st.text_input("Or enter custom theme", placeholder="Example: trusting God during exams")
    minutes = st.slider("Lesson minutes", 5, 45, 15, key="spiritual_minutes")
    render_status_card(
        "Reflection setup",
        "Choose one value or faith theme for today's activity in a simple, age-appropriate way.",
        tone="info",
        icon="🙏",
    )
    if st.button("Generate spiritual lesson"):
        selected_theme = custom_theme.strip() or theme
        try:
            lesson = run_api_action(
                "Generating spiritual guide...",
                "Preparing a calm reflection lesson",
                lambda: api_post(
                    "/learning/spiritual",
                    {"grade": grade, "theme": selected_theme, "lesson_minutes": minutes},
                ),
            )
            st.session_state["spiritual_lesson"] = lesson
            if learner:
                record_learning_interaction(
                    student_id=learner["id"],
                    module_name="spiritual_guide",
                    category="Spiritual Guide",
                    topic=selected_theme,
                    title=lesson["title"],
                    content=lesson,
                    assignment={"grade": grade, "theme": selected_theme, "lesson_minutes": minutes},
                )
            st.success("Spiritual guide is ready ✨")
            st.session_state["spiritual_assignment"] = {"grade": grade, "theme": selected_theme, "lesson_minutes": minutes}
        except Exception as exc:
            st.error(f"Could not generate spiritual lesson: {api_error(exc)}")

    lesson = st.session_state.get("spiritual_lesson")
    if lesson:
        assignment = st.session_state.get("spiritual_assignment", {})
        render_section_header("Spiritual Guide", body=lesson["title"])
        top_col1, top_col2 = st.columns(2, gap="large")
        with top_col1:
            info_card("Theme", assignment.get("theme", lesson["title"]), "🌱")
        with top_col2:
            info_card("Bible reference", lesson["bible_reference"], "📖")
        info_card("Story lesson", lesson["story_lesson"], "📚")
        render_list_card("Reflection questions", lesson["reflection_questions"], "❓", "No reflection questions yet.")
        info_card("Activity", lesson["practical_activity"], "🤝")
        info_card("Prayer", lesson["prayer"], "🙏")
        st.caption(f"Memory verse summary: {lesson['memory_verse_summary']}")
        render_status_card("Interaction tracking", "This reflection activity is being tracked in your child's learning journey.", tone="success", icon="📈")


def render_hobbies(students: list[dict]) -> None:
    st.header("🎨 Hobbies & Creativity")
    helper_text("Create a fun activity for music, drawing, or creativity as part of whole-child growth.")
    learner = selected_student(students)
    if not learner:
        return

    render_status_card(
        "Activity setup",
        "Pick the hobby area, difficulty, time available, and materials on hand to create today's activity.",
        tone="info",
        icon="🎨",
    )
    with st.form("generate_hobby_activity"):
        category = st.selectbox("Hobby category", ["Music", "Drawing", "Creativity"])
        difficulty = st.selectbox("Difficulty", ["Beginner", "Intermediate", "Challenge"])
        available_time = st.slider("Available time", 10, 120, 30, step=5)
        activity_type = st.selectbox(
            "Activity type",
            [
                "Hands-on project",
                "Practice challenge",
                "Creative game",
                "Reflection activity",
                "Performance or sharing activity",
            ],
        )
        materials = st.text_area(
            "Available materials",
            value="Paper, pencil, colors, notebook, phone timer",
            help="List what the learner can safely use today.",
        )
        submitted = st.form_submit_button("Generate creative activity")

    if submitted:
        try:
            activity = run_api_action(
                "Generating creative activity...",
                "Designing a fun hobby challenge",
                lambda: api_post(
                    "/hobbies/activity",
                    {
                        "student_id": learner["id"],
                        "category": category,
                        "difficulty": difficulty,
                        "available_time_minutes": available_time,
                        "available_materials": materials,
                        "activity_type": activity_type,
                    },
                ),
            )
            st.session_state["hobby_activity"] = activity
            record_learning_interaction(
                student_id=learner["id"],
                module_name="hobbies_creativity",
                category=category,
                topic=activity_type,
                title=activity["title"],
                content=activity,
                assignment={
                    "category": category,
                    "difficulty": difficulty,
                    "available_time_minutes": available_time,
                    "available_materials": materials,
                    "activity_type": activity_type,
                },
            )
            st.success("Creative activity is ready 🎉")
            st.session_state["hobby_assignment"] = {
                "category": category,
                "difficulty": difficulty,
                "available_time_minutes": available_time,
                "available_materials": materials,
                "activity_type": activity_type,
            }
        except Exception as exc:
            st.error(f"Could not generate hobby activity: {api_error(exc)}")

    activity = st.session_state.get("hobby_activity")
    if activity:
        assignment = st.session_state.get("hobby_assignment", {})
        render_section_header("Hobbies & Creativity", body=activity["title"])
        top_col1, top_col2 = st.columns(2, gap="large")
        with top_col1:
            info_card("Activity title", activity["title"], "🎉")
        with top_col2:
            info_card("Category", assignment.get("category", "Hobbies & Creativity"), "🖍️")
        info_card("Objective", activity["objective"], "🎯")
        render_list_card("Materials needed", activity["materials"], "🧰", "No materials were listed.")
        render_list_card("Steps", activity["steps"], "👣", "No steps were listed.")
        info_card("Parent involvement", activity["parent_involvement"], "🤝")
        render_list_card("Reflection questions", activity["reflection_questions"], "💭", "No reflection questions were listed.")
        info_card("Follow-up activity", activity["follow_up_activity"], "🚀")
        render_status_card("Interaction tracking", "This creative activity is being tracked in your child's learning journey.", tone="success", icon="📈")


def render_progress(students: list[dict]) -> None:
    user = st.session_state["user"]
    is_learner = user["role"] == "learner"
    st.header("🌟 My Learning Adventure" if is_learner else "📊 Progress Dashboard")
    helper_text("Here is your learning adventure for today." if is_learner else "See your child's learning journey and whole-child growth over time.")
    learner = selected_student(students)
    if is_learner and learner:
        current_progress = st.session_state.get("progress")
        if not current_progress or current_progress.get("student", {}).get("id") != learner["id"]:
            try:
                st.session_state["progress"] = run_api_action(
                    "Loading your dashboard...",
                    "Collecting your latest progress",
                    lambda: api_get(f"/progress/student/{learner['id']}"),
                )
            except Exception as exc:
                st.error(f"Could not load progress: {api_error(exc)}")
    if learner and st.button("Load progress" if not is_learner else "Load my progress"):
        try:
            st.session_state["progress"] = run_api_action(
                "Loading progress...",
                "Collecting recent revision attempts",
                lambda: api_get(f"/progress/student/{learner['id']}"),
            )
        except Exception as exc:
            st.error(f"Could not load progress: {api_error(exc)}")

    progress = st.session_state.get("progress")
    if progress:
        if is_learner:
            avg = progress["average_percentage"]
            recent_interactions = progress.get("learning_interactions", [])
            recent_attempts = progress.get("recent_attempts", [])
            today_recommendation = student_summary_recommendation(progress)
            render_status_card(
                "Welcome back",
                f"{progress['student']['name']}, today's activity and recommended next step are ready.",
                tone="success",
                icon="🚀",
            )
            render_quick_launch(
                "Quick launch",
                [
                    ("My Revision", "📘 My Revision", "Open revision practice"),
                    ("Coding & AI Fun", "💻 Coding & AI Fun", "Open coding lessons"),
                    ("Bible Lessons", "🙏 Bible Lessons", "Open spiritual lessons"),
                    ("Hobbies & Creativity", "🎨 Hobbies & Creativity", "Open hobbies activities"),
                    ("My Progress", "📊 My Progress", "Refresh your progress view"),
                ],
            )
            panel_col1, panel_col2 = st.columns(2, gap="large")
            with panel_col1:
                render_panel("Today's recommended activity", today_recommendation, "🎯", accent="dk-recommendation")
            with panel_col2:
                render_panel(
                    "Encouraging message",
                    "Every small step counts. Learn a little, create something, and let your parent celebrate the journey with you.",
                    "🌈",
                )
            render_section_header("Recent learning journey")
            render_recent_activity_panel(
                interactions=recent_interactions,
                attempts=recent_attempts,
                empty_message="Complete your first activity to start building your learning journey.",
            )

        st.subheader(f"🌟 {progress['student']['name']} - Grade {progress['student']['grade']}")
        avg = progress["average_percentage"]
        mini_metric_cards(
            [
                ("📝", "Attempts", str(progress["attempts_count"])),
                ("📈", "Average", f"{avg}%" if avg is not None else "Not marked yet"),
                ("🎨", "Learning activities", str(len(progress.get("learning_interactions", [])))),
            ]
        )
        overview_col1, overview_col2 = st.columns(2, gap="large")
        with overview_col1:
            weak_areas = progress.get("recent_weak_areas", [])
            render_polished_table(
                "Weak Areas",
                build_weak_area_rows(
                    weak_areas,
                    subject_or_module="Revision",
                    topic="Recent learning",
                    suggested_action="Revise this topic and practice one more short activity.",
                ),
                "No weak areas have been identified yet.",
                "🎯",
            )
        with overview_col2:
            render_panel(
                "Recommended next step",
                student_summary_recommendation(progress),
                "➡️",
                accent="dk-recommendation",
            )

        if progress["recent_attempts"]:
            st.write("**🗂️ Revision progress**")
            st.dataframe(
                [
                    {
                        "Assessment": item["assessment_id"],
                        "Date": item["date"],
                        "Subject": item["subject"],
                        "Topic": item["topic"],
                        "Score": "" if item["score"] is None else item["score"],
                        "Total": "" if item["total_marks"] is None else item["total_marks"],
                        "Percentage": "" if item["percentage"] is None else f"{item['percentage']}%",
                    }
                    for item in progress["recent_attempts"]
                ],
                use_container_width=True,
                hide_index=True,
            )
        else:
            info_card("No revision attempts yet", "Generate revision questions to start tracking progress.", "🌱")

        interactions = progress.get("learning_interactions", [])
        module_sections = [
            ("💻 Coding / AI activities", "coding_ai"),
            ("🙏 Spiritual lessons", "spiritual_guide"),
            ("🎨 Hobbies activities", "hobbies_creativity"),
        ]
        for title, module_name in module_sections:
            st.write(f"**{title}**")
            rows = learning_rows_by_module(interactions, module_name)
            if rows:
                st.dataframe(rows, use_container_width=True, hide_index=True)
            else:
                render_panel(title, "No activity has been tracked in this part of the learning journey yet.", "🌱")

        render_section_header("Recent learning journey")
        render_recent_activity_panel(
            interactions=interactions,
            attempts=progress.get("recent_attempts", []),
            empty_message="Learning activity will appear here once revision or modules are used.",
        )
        render_polished_table(
            "Progress Summary",
            build_progress_summary_rows(
                learner_name=progress["student"]["name"],
                grade=str(progress["student"]["grade"]),
                revision_attempts=progress.get("recent_attempts", []),
                interactions=interactions,
                average_score=f"{avg}%" if avg is not None else "",
                recommended_next_step=student_summary_recommendation(progress),
            ),
            "Progress summary rows will appear here once activity has been tracked.",
            "📈",
        )

    if user["role"] == "parent":
        st.subheader("Your child's learning journey")
        if st.button("Load family summary"):
            try:
                summary = run_api_action(
                    "Loading family summary...",
                    "Summarizing learner progress",
                    lambda: api_get("/progress/summary"),
                )
                render_progress_summary(summary)
            except Exception as exc:
                st.error(f"Could not load family summary: {api_error(exc)}")


if "access_token" not in st.session_state or "user" not in st.session_state:
    show_auth_screen()
    st.stop()

st.markdown(
    """
    <div class="portal-brand-wrap">
        <div class="portal-brand-title">Digital Kids Assistant</div>
        <div class="portal-subtitle">Learning for school, skills for life in a parent-guided space for whole-child growth.</div>
    </div>
    """,
    unsafe_allow_html=True,
)

page = show_sidebar()
students = load_students()
user_role = st.session_state["user"]["role"]

if user_role == "admin":
    if page == "🛠️ Admin Dashboard":
        render_admin_dashboard()
    elif page == "👨‍👩‍👧 Parents":
        render_admin_parents()
    elif page == "👧 Learners":
        render_admin_learners()
    elif page == "📊 Progress":
        render_admin_progress()
    elif page == "📝 Assessments":
        render_admin_assessments()
    elif page == "🎯 Module Interactions":
        render_admin_interactions()
    elif page == "📈 Platform Summary":
        render_admin_summary()
elif user_role == "parent":
    if page == "👨‍👩‍👧 Dashboard":
        render_dashboard(students)
    elif page == "👧 My Children":
        render_learners(students)
    elif page in ("📘 Generate Revision", "📘 My Revision"):
        render_revision(students)
    elif page == "✅ Mark Answers":
        render_marking(students)
    elif page in ("💻 Coding & AI", "💻 Coding & AI Fun"):
        render_coding(students)
    elif page in ("🙏 Values / Bible Lessons", "🙏 Bible Lessons"):
        render_spiritual(students)
    elif page == "🎨 Hobbies & Creativity":
        render_hobbies(students)
    elif page in ("🏠 My Home", "📊 Progress", "📊 My Progress"):
        render_progress(students)
else:
    if page in ("📘 Generate Revision", "📘 My Revision"):
        render_revision(students)
    elif page in ("💻 Coding & AI", "💻 Coding & AI Fun"):
        render_coding(students)
    elif page in ("🙏 Values / Bible Lessons", "🙏 Bible Lessons"):
        render_spiritual(students)
    elif page == "🎨 Hobbies & Creativity":
        render_hobbies(students)
    elif page in ("🏠 My Home", "📊 Progress", "📊 My Progress"):
        render_progress(students)
