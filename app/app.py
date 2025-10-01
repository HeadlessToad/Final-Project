# Final-Project/app/app.py
import streamlit as st
import requests

st.set_page_config(page_title="Waste Sort", page_icon="♻️")
st.title("Waste Sorting Classifier (MVP)")

file = st.file_uploader("Upload a waste image")
if file is not None:
    with st.spinner("Classifying..."):
        r = requests.post("http://localhost:8500/api/classify", files={"file": file.getvalue()})
    if r.ok:
        st.json(r.json())
    else:
        st.error(f"Backend error: {r.status_code} {r.text}")
