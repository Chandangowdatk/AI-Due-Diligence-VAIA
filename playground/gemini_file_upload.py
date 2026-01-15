from google import genai
from pathlib import Path

from google import genai
from pathlib import Path
import time
import os

# =========================
# CONFIG
# =========================

GOOGLE_API_KEY = "AIzaSyANku1RFbXj0gcHkd2pLE8lJ2-7saQEO8A"  # strongly recommended
client = genai.Client(api_key=GOOGLE_API_KEY)

pdf_paths = [
    Path("/Users/chandangowdatk/Development/VAIA-Due-Diligence/playground/documents/1741838270045-Competitors analysis.pdf"),
    Path("/Users/chandangowdatk/Development/VAIA-Due-Diligence/playground/documents/1741838270052-CerboTech Broucher.pdf"),
    Path("/Users/chandangowdatk/Development/VAIA-Due-Diligence/playground/documents/CerboTech -NeuroTech.pdf"),
    Path("/Users/chandangowdatk/Development/VAIA-Due-Diligence/playground/documents/Fianancial Statements_CERBOTECH.pdf")
]

# =========================
# HELPERS
# =========================

def wait_for_file_active(client, file_name, timeout=120, poll_interval=2):
    """
    Polls file status until it becomes ACTIVE or fails.
    """
    start = time.time()

    while True:
        file = client.files.get(name=file_name)

        print(f"⏳ File: {file.display_name or file.name} | State: {file.state}")

        if file.state == "ACTIVE":
            print(f"✅ File READY: {file.display_name or file.name}")
            return file

        if file.state == "FAILED":
            raise RuntimeError(f"❌ File processing FAILED: {file.display_name or file.name}")

        if time.time() - start > timeout:
            raise TimeoutError(f"⏰ Timeout waiting for file: {file.display_name or file.name}")

        time.sleep(poll_interval)

# =========================
# UPLOAD + STATUS TRACKING
# =========================

uploaded_files = []

for path in pdf_paths:
    if not path.exists():
        raise FileNotFoundError(f"File not found: {path}")

    print(f"\n📤 Uploading: {path.name}")
    uploaded = client.files.upload(file=path)

    print(f"➡️ Uploaded: {uploaded.name} | Initial State: {uploaded.state}")

    ready_file = wait_for_file_active(client, uploaded.name)
    uploaded_files.append(ready_file)

"""
📤 Uploading: 1741838270045-Competitors analysis.pdf
➡️ Uploaded: files/jcjefvjdme4p | Initial State: FileState.ACTIVE
⏳ File: files/jcjefvjdme4p | State: FileState.ACTIVE
✅ File READY: files/jcjefvjdme4p

📤 Uploading: 1741838270052-CerboTech Broucher.pdf
➡️ Uploaded: files/6cogekopwdlz | Initial State: FileState.ACTIVE
⏳ File: files/6cogekopwdlz | State: FileState.ACTIVE
✅ File READY: files/6cogekopwdlz

📤 Uploading: CerboTech -NeuroTech.pdf
➡️ Uploaded: files/z4cdtxbzspa5 | Initial State: FileState.ACTIVE
⏳ File: files/z4cdtxbzspa5 | State: FileState.ACTIVE
✅ File READY: files/z4cdtxbzspa5

📤 Uploading: Fianancial Statements_CERBOTECH.pdf
➡️ Uploaded: files/vf5i15w24of7 | Initial State: FileState.ACTIVE
⏳ File: files/vf5i15w24of7 | State: FileState.ACTIVE
✅ File READY: files/vf5i15w24of7
"""

# =========================
# MODEL CALL (FILES ARE READY)
# =========================

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=[
        "You are analyzing multiple documents related to CerboTech.",
        "Provide me the competitors ",
        "Team and advisory board of cerboTech",
        *uploaded_files
    ],
)

print("\n📄 MODEL RESPONSE:\n")
print(response.text)


"""
📄 MODEL RESPONSE:

Based on the provided documents related to CerboTech:

---

### **CerboTech Competitors**

CerboTech identifies both **Direct** and **Indirect** competitors, categorized across Brain-Computer Interface (BCI) technology, Brain Train Games, Brain Music, and general Mental Health solutions.

**1. From Competitive Landscape Analysis (Document 1, Page 1):**

*   **Direct Competitors:**
    *   **Muse (by InteraXon):** Established brand, advanced EEG technology, strong global presence.
    *   **Emotiv:** High-quality neurofeedback devices, strong research backing.
    *   **NeuroSky:** Affordable BCI devices, proven technology.
*   **Indirect Competitors:**
    *   **Mindvalley:** Strong content on meditation and self-improvement.
    *   **Calm/Headspace:** Popular meditation and stress management apps.

**2. From Key Competitors (Document 2, Page 13):**

*   **Brain Train Games:**
    *   Lumosity (USA Based)
    *   Excellent Brain (Israel Based)
    *   Neeuro (Singapore Based)
    *   Cognifit
*   **Brain Music:**
    *   Brain FM (USA Based)
    *   Muse (Canada Based)
    *   Free – Binaural – Beats
*   **BCI Technology:**
    *   Neeuro (Singapore Based)
    *   Muse (Canada Based)
    *   Excellent Brain (Israel Based)
*   **Work on Mental Health:**
    *   Kernel (USA Based)
    *   Dreem (France Based)
    *   Brain Co. (USA Based)

---

### **CerboTech Team & Advisory Board**

**1. Our Team (Document 2, Page 18 & Document 3, Page 13, 17):**

*   **SWETA PRAJAPATI:** Founder & Director
    *   *Expertise:* Scientific research with MCA and 12 years of experience in brain and cognitive skills development.
*   **CHIRAG GADARA:** Co-Founder & Director
    *   *Expertise:* B.E. with 15 years of experience in IT and product development.
*   **VANDANABEN HITESHBHAI MEHRA:** Director (as per Annual Report)
    *   *Also listed as:* Hitesh Mehra, Advisor – Technology and Marketing (as per Pitch Deck).
    *   *Note:* The annual report shows Vandana Hiteshbhai Mehra as a director and signatory, while the pitch deck lists Hitesh Mehra as an advisor in the "Our Team" section. It is likely referring to the same individual or a closely related person with multiple key roles.

**2. Advisory Board (Document 2, Page 18):**

*   **Dr. Krishna Mayapuram:** Pro. IIT Gandhinagar, Cognitive Science.
*   **Rukesh Patel:** Managing Partner Cloudwerx | Expertise in Transformation, Culture, and Cloud | Former CTO at Jio Financial, Mumbai.
*   **Dr. Madhu Singh:** Director B.M Institute of Mental Health.
*   **Dr. Jini Gopinath:** Chief Psychology, UrDost.
*   **Dixit Patel:** Technology Support and analyst.
"""