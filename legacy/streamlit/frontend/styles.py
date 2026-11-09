import streamlit as st


APP_STYLES = """
<style>
:root {
    --dk-blue: #00307B;
    --dk-green: #159F76;
    --dk-soft-green: #EAFBF4;
    --dk-soft-blue: #EEF5FF;
    --dk-warm: #FFB703;
    --dk-text: #102A43;
    --dk-muted: #627D98;
    --dk-card-bg: #FFFFFF;
    --dk-border: #D9E2EC;
}
.stApp {
    background:
        radial-gradient(circle at top left, rgba(16, 185, 129, 0.12), transparent 28%),
        radial-gradient(circle at top right, rgba(242, 189, 67, 0.16), transparent 30%),
        linear-gradient(135deg, #F8FBFF 0%, #EEF7FF 45%, #F7FFF8 100%);
}
[data-testid="stSidebar"] {
    background: linear-gradient(180deg, #F8FBFF 0%, #EEF7FF 100%) !important;
    border-right: 1px solid #E2E8F0 !important;
}
.st-emotion-cache-wyoiad {
    background: transparent !important;
}
.block-container {
    max-width: 1180px;
    padding-top: 1.65rem;
    padding-bottom: 3rem;
}
.stButton > button, .stFormSubmitButton > button {
    border-radius: 999px;
    border: none;
    background: #F2BD43;
    color: #0F172A;
    font-weight: 900;
    padding: 0.72rem 1rem;
    box-shadow: 0 10px 24px rgba(242, 189, 67, 0.28);
}
.stButton > button:hover, .stFormSubmitButton > button:hover,
.stButton > button:focus, .stFormSubmitButton > button:focus,
.stButton > button:active, .stFormSubmitButton > button:active {
    color: #0F172A;
    background: #E5AA24;
    box-shadow: 0 14px 30px rgba(242, 189, 67, 0.35);
    transform: translateY(-1px);
    border: none !important;
}
.stButton > button *, .stFormSubmitButton > button * {
    color: #0F172A !important;
}
.stTextInput input, .stTextArea textarea, .stSelectbox [data-baseweb="select"] > div, .stNumberInput input, .stPasswordInput input {
    background: #FFFFFF !important;
    color: #0F172A !important;
    border: 1px solid #CBD5E1 !important;
    border-radius: 14px !important;
    min-height: 46px !important;
    box-shadow: none !important;
    box-sizing: border-box !important;
    text-overflow: ellipsis !important;
    padding-right: 2.75rem !important;
    overflow: hidden !important;
    white-space: nowrap !important;
}
.stTextInput input::placeholder,
.stTextArea textarea::placeholder,
.stNumberInput input::placeholder,
.stPasswordInput input::placeholder {
    color: #94A3B8 !important;
    opacity: 1 !important;
    text-overflow: ellipsis !important;
}
.stPasswordInput [data-testid="stBaseButton-secondary"] {
    min-width: 36px !important;
    width: 36px !important;
    height: 36px !important;
    padding: 0 !important;
    margin-right: 0.35rem !important;
    background: transparent !important;
    box-shadow: none !important;
}
.stPasswordInput [data-testid="stBaseButton-secondary"] svg {
    fill: #64748B !important;
}
.stTextInput [data-testid="InputInstructions"],
.stPasswordInput [data-testid="InputInstructions"],
.stNumberInput [data-testid="InputInstructions"],
.stTextArea [data-testid="InputInstructions"] {
    display: none !important;
}
.stTextInput,
.stPasswordInput,
.stNumberInput,
.stTextArea {
    position: relative !important;
}
.stTextInput > div,
.stPasswordInput > div,
.stNumberInput > div,
.stTextArea > div {
    overflow: hidden !important;
}
.stTextInput label, .stTextArea label, .stSelectbox label, .stRadio label {
    color: #334155 !important;
    font-weight: 700 !important;
}
.dk-card {
    background: var(--dk-card-bg);
    border: 1px solid var(--dk-border);
    border-radius: 10px;
    padding: 1rem 1.05rem;
    margin: 0.45rem 0 0.8rem 0;
    box-shadow: 0 10px 25px rgba(16, 42, 67, 0.06);
}
.dk-card-body {
    color: var(--dk-muted);
    line-height: 1.6;
}
.dk-card-title {
    font-weight: 700;
    font-size: 1rem;
    margin-bottom: 0.35rem;
    color: var(--dk-text);
}
.dk-helper {
    color: var(--dk-muted);
    font-size: 0.95rem;
    margin: 0.2rem 0 1rem 0;
}
.dk-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 0.8rem;
    margin: 0.8rem 0;
}
.dk-big-number {
    font-size: 1.8rem;
    font-weight: 800;
    color: var(--dk-blue);
}
.dk-section {
    margin: 1.2rem 0;
}
.dk-info-card,
.dk-feature-card,
.dk-metric-card,
.dk-cta-card {
    height: 100%;
}
.dk-section-eyebrow {
    color: var(--dk-green);
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    font-size: 0.78rem;
    margin-bottom: 0.2rem;
}
.dk-section-title {
    color: var(--dk-blue);
    font-weight: 800;
    font-size: 1.55rem;
    margin-bottom: 0.3rem;
}
.dk-section-copy {
    color: var(--dk-muted);
    margin-bottom: 0.85rem;
    line-height: 1.6;
}
.dk-pill {
    display: inline-block;
    padding: 0.22rem 0.55rem;
    border-radius: 999px;
    background: var(--dk-soft-green);
    border: 1px solid rgba(21, 159, 118, 0.22);
    margin: 0.15rem 0.2rem 0.15rem 0;
    font-size: 0.9rem;
    color: var(--dk-green);
}
.dk-tag {
    display: inline-block;
    background: var(--dk-soft-blue);
    color: var(--dk-blue);
    border: 1px solid rgba(0, 48, 123, 0.12);
    padding: 0.18rem 0.55rem;
    border-radius: 999px;
    font-size: 0.82rem;
    margin-right: 0.3rem;
    margin-bottom: 0.3rem;
}
.dk-hero {
    background: linear-gradient(135deg, #EEF5FF 0%, #EAFBF4 100%);
    border: 1px solid rgba(0, 48, 123, 0.08);
    border-radius: 14px;
    padding: 1.5rem;
    box-shadow: 0 18px 40px rgba(16, 42, 67, 0.08);
    margin-bottom: 1rem;
}
.dk-eyebrow {
    color: var(--dk-green);
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    font-size: 0.8rem;
    margin-bottom: 0.4rem;
}
.dk-hero h1 {
    color: var(--dk-blue);
    font-size: 2.7rem;
    line-height: 1.05;
    margin: 0.15rem 0 0.7rem 0;
}
.dk-hero-copy {
    color: var(--dk-text);
    font-size: 1.05rem;
    line-height: 1.6;
    margin-bottom: 0.9rem;
}
.dk-trust {
    color: var(--dk-muted);
    font-size: 0.94rem;
    margin-top: 0.55rem;
}
.dk-preview {
    background: #FFFFFF;
    border: 1px solid var(--dk-border);
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 14px 32px rgba(16, 42, 67, 0.08);
}
.dk-preview-head {
    color: var(--dk-blue);
    font-weight: 800;
    margin-bottom: 0.8rem;
}
.dk-preview-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
    padding: 0.58rem 0;
    border-bottom: 1px solid #E6EDF5;
    color: var(--dk-text);
}
.dk-preview-row:last-child {
    border-bottom: none;
}
.dk-preview-label {
    color: var(--dk-muted);
    font-size: 0.92rem;
}
.dk-preview-value {
    font-weight: 700;
    text-align: right;
}
.dk-step {
    background: #FFFFFF;
    border: 1px solid var(--dk-border);
    border-left: 4px solid var(--dk-green);
    border-radius: 10px;
    padding: 0.9rem 1rem;
    margin-bottom: 0.65rem;
    color: var(--dk-text);
}
.dk-step-title {
    font-weight: 700;
    margin-bottom: 0.25rem;
}
.dk-step-body {
    color: var(--dk-muted);
}
[data-testid="stDataFrame"] {
    overflow-x: auto;
}
.dk-auth-wrap {
    background: #FFFFFF;
    border: 1px solid var(--dk-border);
    border-radius: 12px;
    padding: 1rem 1rem 0.6rem 1rem;
    box-shadow: 0 10px 25px rgba(16, 42, 67, 0.06);
}
.dk-auth-header {
    margin-bottom: 0.8rem;
}
.dk-auth-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 0.8rem;
    margin: 0.4rem 0 1rem 0;
}
.dk-auth-note {
    background: var(--dk-soft-blue);
    border: 1px solid rgba(0, 48, 123, 0.12);
    border-radius: 10px;
    padding: 0.8rem 0.9rem;
    color: var(--dk-text);
    margin-bottom: 0.9rem;
}
.dk-status-card {
    border-radius: 18px;
    padding: 0.9rem 1rem;
    margin: 0.6rem 0 0.9rem 0;
    border: 1px solid transparent;
}
.dk-status-info {
    background: #F7FBFF;
    border-color: rgba(0, 48, 123, 0.14);
}
.dk-status-success {
    background: #F1FCF7;
    border-color: rgba(21, 159, 118, 0.2);
}
.dk-status-error {
    background: #FFF4F4;
    border-color: rgba(185, 28, 28, 0.18);
}
.dk-status-warning {
    background: #FFF9EB;
    border-color: rgba(255, 183, 3, 0.28);
}
.dk-entry-shell {
    margin: 0 auto;
}
.dk-brand-bar {
    display: flex;
    align-items: center;
    gap: 0.95rem;
    background: rgba(255, 255, 255, 0.74);
    border: 1px solid rgba(217, 226, 236, 0.78);
    border-radius: 24px;
    padding: 0.95rem 1.15rem;
    box-shadow: 0 16px 38px rgba(15, 23, 42, 0.06);
    margin-bottom: 1rem;
}
.dk-brand-logo {
    width: 58px;
    height: 58px;
    object-fit: contain;
    border-radius: 18px;
    background: linear-gradient(180deg, #FFFFFF 0%, #EEF5FF 100%);
    border: 1px solid rgba(0, 48, 123, 0.08);
    padding: 0.4rem;
}
.dk-brand-title {
    color: #003B7A;
    font-weight: 900;
    font-size: 1.3rem;
    line-height: 1.15;
}
.dk-brand-tagline {
    color: #64748B;
    font-size: 0.94rem;
    margin-top: 0.15rem;
    font-weight: 600;
}
.dk-status-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    background: #ECFDF5;
    border: 1px solid #BBF7D0;
    color: #065F46;
    border-radius: 999px;
    padding: 0.62rem 0.95rem;
    font-weight: 800;
    font-size: 0.9rem;
    margin-bottom: 1rem;
}
.dk-status-dot {
    width: 0.55rem;
    height: 0.55rem;
    border-radius: 999px;
    background: #10B981;
    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0.12);
}
.dk-main-shell {
    background: rgba(255, 255, 255, 0.86);
    border: 1px solid rgba(226, 232, 240, 0.9);
    border-radius: 32px;
    padding: 2rem;
    box-shadow: 0 30px 80px rgba(15, 23, 42, 0.10);
    margin-bottom: 1rem;
}
.dk-main-shell:empty,
.portal-card:empty,
.dk-dashboard-panel:empty,
.dk-brand-bar:empty,
.dk-image-frame:empty {
    display: none !important;
}
.dk-welcome-card {
    background: transparent;
    border: none;
    border-radius: 0;
    padding: 0.4rem 0 0.2rem 0;
    box-shadow: none;
}
.dk-welcome-eyebrow {
    display: inline-flex;
    align-items: center;
    min-height: 34px;
    padding: 0.4rem 0.82rem;
    border-radius: 999px;
    background: rgba(21, 159, 118, 0.10);
    color: var(--dk-green);
    font-size: 0.8rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    margin-bottom: 0.95rem;
}
.dk-welcome-title {
    color: #003B7A;
    font-size: clamp(2.15rem, 4vw, 4rem);
    line-height: 1.04;
    font-weight: 950;
    letter-spacing: -0.04em;
    margin-bottom: 0.9rem;
}
.dk-welcome-copy {
    color: #475569;
    font-size: 1.05rem;
    line-height: 1.68;
    max-width: 37rem;
}
.dk-benefit-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
    margin-top: 1.15rem;
}
.dk-benefit-pill {
    display: inline-flex;
    align-items: center;
    padding: 0.58rem 0.9rem;
    border-radius: 999px;
    background: #EFF6FF;
    border: 1px solid #DBEAFE;
    color: #1D4ED8;
    font-weight: 800;
    font-size: 0.9rem;
}
.dk-image-frame {
    background: rgba(255, 255, 255, 0.96);
    border: 1px solid rgba(217, 226, 236, 0.78);
    border-radius: 28px;
    padding: 0.7rem;
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
}
.dk-image-frame img {
    border-radius: 22px;
}
.dk-mini-note {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 22px;
    padding: 1rem 1.05rem;
    box-shadow: 0 14px 35px rgba(15, 23, 42, 0.06);
    color: #475569;
    font-weight: 700;
    margin-top: 0.9rem;
}
.dk-mini-note-title {
    color: #003B7A;
    font-weight: 900;
    font-size: 1rem;
    margin-bottom: 0.3rem;
}
.dk-auth-card {
    background: #FFFFFF;
    border: 1px solid rgba(217, 226, 236, 0.82);
    border-radius: 28px;
    padding: 1.6rem;
    box-shadow: 0 20px 50px rgba(15, 23, 42, 0.10);
    margin-top: 1.35rem;
}
.dk-auth-title {
    color: #0F172A;
    font-weight: 900;
    font-size: 1.12rem;
    margin-bottom: 0.2rem;
}
.dk-auth-copy {
    color: #64748B;
    line-height: 1.6;
    margin-bottom: 0.9rem;
}
.dk-trust-note {
    margin: 1rem 0 0 0;
    padding: 0.9rem 1rem;
    border-radius: 16px;
    background: rgba(239, 246, 255, 0.86);
    border: 1px solid rgba(191, 219, 254, 0.9);
    color: #334155;
    text-align: left;
    font-weight: 600;
}
.portal-card {
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid #E2E8F0;
    border-radius: 28px;
    padding: 28px;
    box-shadow: 0 20px 50px rgba(15, 23, 42, 0.07);
    margin-bottom: 24px;
}
.dk-page-header {
    margin-bottom: 1.1rem;
}
.dk-page-title {
    color: #003B7A;
    font-size: clamp(1.8rem, 3vw, 2.6rem);
    font-weight: 900;
    margin-bottom: 0.35rem;
    line-height: 1.08;
}
.dk-page-copy {
    color: #64748B;
    font-size: 1rem;
    line-height: 1.65;
    max-width: 48rem;
}
.dk-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 0.85rem;
    margin: 0.9rem 0 1.25rem 0;
}
.dk-stat-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 22px;
    padding: 1rem 1.05rem;
    box-shadow: 0 14px 35px rgba(15, 23, 42, 0.06);
}
.dk-stat-label {
    color: #64748B;
    font-size: 0.92rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
}
.dk-stat-value {
    color: #003B7A;
    font-size: 1.45rem;
    font-weight: 900;
}
.dk-status-good {
    display: inline-flex;
    align-items: center;
    background: #DDF7EC;
    color: #065F46;
    border: 1px solid #BBF7D0;
    border-radius: 999px;
    padding: 0.58rem 0.8rem;
    font-weight: 900;
}
.dk-quick-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 0.9rem;
    margin-top: 0.8rem;
}
.quick-card,
.dk-quick-action {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 22px;
    padding: 1rem;
    box-shadow: 0 14px 35px rgba(15, 23, 42, 0.06);
    transition: all 0.2s ease;
    min-height: 220px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
.quick-card:hover,
.dk-quick-action:hover {
    transform: translateY(-2px);
    border-color: #F2BD43;
    box-shadow: 0 18px 40px rgba(242, 189, 67, 0.20);
}
.quick-icon {
    width: 54px;
    height: 54px;
    border-radius: 18px;
    background: #EAF4FF;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #003B7A;
    font-size: 1.6rem;
    margin-bottom: 18px;
}
.quick-title,
.dk-quick-title {
    color: #003B7A;
    font-weight: 900;
    font-size: 1.1rem;
    margin-bottom: 0.45rem;
}
.quick-description,
.dk-quick-copy {
    color: #64748B;
    font-size: 0.92rem;
    line-height: 1.5;
    font-weight: 600;
    margin-bottom: 1rem;
}
.quick-launch-wrap [data-testid="column"] {
    display: flex;
    flex-direction: column;
}
.quick-launch-wrap .stButton {
    margin-top: auto;
}
.quick-launch-wrap .stButton > button,
.quick-launch-wrap .stButton > button:focus,
.quick-launch-wrap .stButton > button:active {
    background: #F2BD43 !important;
    background-color: #F2BD43 !important;
    color: #0F172A !important;
    border: none !important;
    border-radius: 999px !important;
    min-height: 46px !important;
    box-shadow: 0 10px 24px rgba(242, 189, 67, 0.28) !important;
}
.quick-launch-wrap .stButton > button:hover {
    background: #E5AA24 !important;
    background-color: #E5AA24 !important;
    color: #0F172A !important;
    border: none !important;
    box-shadow: 0 14px 30px rgba(242, 189, 67, 0.35) !important;
}
.quick-launch-wrap .stButton > button *,
.quick-launch-wrap .stButton > button span,
.quick-launch-wrap .stButton > button p,
.quick-launch-wrap .stButton > button div {
    color: #0F172A !important;
}
.sidebar-profile-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 24px;
    padding: 18px;
    box-shadow: 0 14px 35px rgba(15, 23, 42, 0.06);
    margin-bottom: 0.9rem;
}
.sidebar-status {
    background: #DDF7EC;
    color: #065F46;
    border-radius: 18px;
    padding: 12px 14px;
    font-weight: 800;
    border: 1px solid #BBF7D0;
    margin: 0.75rem 0 0.95rem 0;
}
.sidebar-role {
    color: #64748B;
    font-size: 0.92rem;
    font-weight: 700;
    margin-top: 0.2rem;
}
.sidebar-name {
    color: #003B7A;
    font-size: 1.05rem;
    font-weight: 900;
}
[data-testid="stSidebar"] .stRadio > label {
    font-weight: 800 !important;
    color: #003B7A !important;
}
[data-testid="stSidebar"] [role="radiogroup"] > label {
    background: transparent !important;
    border: 1px solid transparent !important;
    border-radius: 14px !important;
    padding: 0.42rem 0.55rem !important;
    margin-bottom: 0.22rem !important;
}
[data-testid="stSidebar"] [role="radiogroup"] > label:hover {
    background: #F8FBFF !important;
}
[data-testid="stSidebar"] [role="radiogroup"] > label[data-checked="true"] {
    background: #EAF4FF !important;
    border-left: 4px solid #F2BD43 !important;
    color: #003B7A !important;
    font-weight: 900 !important;
}
[data-testid="stDataFrame"] {
    background: transparent !important;
    border-radius: 20px !important;
    border: 1px solid #E2E8F0 !important;
    overflow: hidden !important;
}
[data-testid="stDataFrame"] div {
    color: #000000 !important;
}
.stDataFrameGlideDataEditor,
.stDataFrameGlideDataEditor .dvn-scroller,
.stDataFrameGlideDataEditor .dvn-scroll-inner,
.stDataFrameGlideDataEditor .dvn-stack {
    background: transparent !important;
    color: #000000 !important;
}
.stDataFrameGlideDataEditor * {
    color: #000000 !important;
}
.stTable table {
    background: #FFFFFF !important;
    border: 1px solid #E2E8F0 !important;
}
.stTable th {
    background: #F4FAFF !important;
    color: #003B7A !important;
}
.stTable td {
    color: #0F172A !important;
}
.dk-dashboard-panel {
    background: #FFFFFF;
    border: 1px solid var(--dk-border);
    border-radius: 28px;
    padding: 1.35rem 1.4rem;
    margin: 0.5rem 0 1rem 0;
    box-shadow: 0 20px 50px rgba(15, 23, 42, 0.07);
}
.dk-panel-title {
    color: var(--dk-blue);
    font-weight: 800;
    font-size: 1.06rem;
    margin-bottom: 0.55rem;
}
.dk-panel-copy {
    color: var(--dk-muted);
    line-height: 1.6;
}
.dk-recommendation {
    background: linear-gradient(135deg, #EEF5FF 0%, #EAFBF4 100%);
    border: 1px solid rgba(21, 159, 118, 0.16);
}
.dk-journey-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.7rem 0;
    border-bottom: 1px solid #E6EDF5;
}
.dk-journey-row:last-child {
    border-bottom: none;
}
.dk-journey-meta {
    color: var(--dk-muted);
    font-size: 0.9rem;
}
.dk-journey-title {
    font-weight: 700;
    color: var(--dk-text);
    margin-bottom: 0.15rem;
}
.dk-list-row {
    display: grid;
    grid-template-columns: 28px 1fr;
    gap: 0.55rem;
    padding: 0.45rem 0;
    border-bottom: 1px solid #E6EDF5;
    color: var(--dk-text);
}
.dk-list-row:last-child {
    border-bottom: none;
}
.stTabs [data-baseweb="tab-list"] {
    gap: 0.35rem;
    margin-bottom: 0.9rem;
    background: #F8FAFC;
    border: 1px solid rgba(226, 232, 240, 0.9);
    border-radius: 999px;
    padding: 0.28rem;
}
.stTabs [data-baseweb="tab"] {
    border-radius: 999px;
    padding: 0.5rem 0.95rem;
    background: transparent;
    border: none;
    color: #475569;
    font-weight: 700;
}
.stTabs [aria-selected="true"] {
    background: #FFFFFF;
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
    color: #003B7A;
}
.dk-cta-card {
    background: linear-gradient(135deg, #FFFFFF 0%, #F7FBFF 100%);
}
.portal-brand-wrap {
    margin-bottom: 1rem;
}
.portal-brand-title {
    color: #003B7A !important;
    font-size: 2.1rem;
    line-height: 1.05;
    font-weight: 900;
    margin-bottom: 0.2rem;
}
.portal-subtitle {
    color: #64748B !important;
    font-size: 1rem;
    line-height: 1.6;
    font-weight: 600;
}
.stApp h1, .stApp h2, .stApp h3, .stApp h4 {
    color: #003B7A !important;
    font-weight: 900 !important;
}
p, li, label, .stMarkdown, .stCaption {
    color: var(--dk-text);
}
.stSelectbox [data-baseweb="select"] * ,
div[data-baseweb="popover"] *,
ul[role="listbox"] *,
[role="option"] * {
    color: #0F172A !important;
}
[data-testid="stSelectbox"] [data-baseweb="select"] > div,
[data-testid="stSelectbox"] [data-baseweb="select"] span,
[data-testid="stSelectbox"] [data-baseweb="select"] input,
[data-testid="stSelectbox"] [data-baseweb="select"] div {
    color: #0F172A !important;
    background: #FFFFFF !important;
}
[data-testid="stSelectbox"] [data-baseweb="select"] svg {
    fill: #64748B !important;
}
div[data-baseweb="popover"] {
    background: #1F2937 !important;
    border: 1px solid #334155 !important;
    border-radius: 16px !important;
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12) !important;
}
ul[role="listbox"] {
    background: #1F2937 !important;
    border-radius: 14px !important;
    padding: 0.35rem !important;
}
li[role="option"] {
    background: #1F2937 !important;
    color: #FFFFFF !important;
    border-radius: 12px !important;
}
li[role="option"] *,
div[role="option"] *,
[data-testid="stSelectboxVirtualDropdown"] *,
div[data-baseweb="menu"] *,
div[data-baseweb="popover"] [role="option"] {
    color: #FFFFFF !important;
}
li[role="option"]:hover,
li[role="option"][aria-selected="true"] {
    background: #334155 !important;
    color: #FFFFFF !important;
}
li[role="option"]:hover *,
li[role="option"][aria-selected="true"] *,
div[role="option"][aria-selected="true"] * {
    color: #FFFFFF !important;
}
@media (max-width: 900px) {
    .dk-hero h1 {
        font-size: 2rem;
    }
    .dk-grid {
        grid-template-columns: 1fr;
    }
}
@media (max-width: 768px) {
    .block-container {
        padding-top: 1rem;
        padding-left: 0.85rem;
        padding-right: 0.85rem;
        padding-bottom: 2rem;
    }
    .dk-hero {
        padding: 1rem;
    }
    .dk-hero h1 {
        font-size: 1.7rem;
        line-height: 1.15;
    }
    .dk-hero-copy,
    .dk-panel-copy,
    .dk-card-body,
    .dk-helper,
    .dk-trust,
    .dk-section-copy {
        font-size: 0.98rem;
    }
    .dk-section-title {
        font-size: 1.25rem;
    }
    .dk-dashboard-panel,
    .dk-card,
    .dk-auth-wrap,
    .dk-preview,
    .dk-welcome-card,
    .dk-auth-card,
    .portal-card {
        padding: 0.9rem;
    }
    .dk-main-shell {
        padding: 1rem;
        border-radius: 24px;
    }
    .dk-stats-grid,
    .dk-quick-grid {
        grid-template-columns: 1fr;
    }
    .dk-brand-bar {
        padding: 0.85rem 0.9rem;
        border-radius: 20px;
    }
    .dk-brand-logo {
        width: 48px;
        height: 48px;
        border-radius: 14px;
    }
    .dk-welcome-title {
        font-size: clamp(1.9rem, 8vw, 2.6rem);
        line-height: 1.08;
    }
    .dk-welcome-copy,
    .dk-auth-copy,
    .dk-trust-note {
        font-size: 0.98rem;
    }
    .dk-benefit-pills {
        gap: 0.45rem;
    }
    .dk-benefit-pill {
        width: 100%;
        justify-content: center;
    }
    .stButton > button,
    .stFormSubmitButton > button {
        width: 100%;
        min-height: 46px;
        font-size: 1rem;
    }
    [data-testid="stHorizontalBlock"] {
        flex-wrap: wrap;
        gap: 0.75rem;
    }
    [data-testid="stHorizontalBlock"] > div {
        min-width: 100% !important;
        flex: 1 1 100% !important;
    }
    [data-testid="stDataFrame"] {
        font-size: 0.92rem;
    }
}
</style>
"""


def apply_global_styles() -> None:
    st.markdown(APP_STYLES, unsafe_allow_html=True)
