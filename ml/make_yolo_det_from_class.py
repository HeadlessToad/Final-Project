import os, shutil, random
from pathlib import Path

# CONFIG
SOURCE_DIR = r"C:\Users\doppe\Documents\Final-Project\ml\data\trashnet\dataset-resized"   # current class folders
DEST_DIR   = r"C:\Users\doppe\Documents\Final-Project\ml\data\trashnet_det"  # output root
VAL_RATIO  = 0.3 # fraction of data for validation
SEED = 42

random.seed(SEED)
if not os.path.exists(SOURCE_DIR):
    print(f"ERROR: SOURCE_DIR does not exist: {SOURCE_DIR}")
    exit(1)
classes = sorted([d for d in os.listdir(SOURCE_DIR) if (Path(SOURCE_DIR)/d).is_dir()])
if not classes:
    print(f"ERROR: No class folders found in {SOURCE_DIR}")
    exit(1)
class_to_id = {c:i for i,c in enumerate(classes)}
print("Classes -> IDs:", class_to_id)

# Create dirs
for split in ["train","val"]:
    (Path(DEST_DIR)/"images"/split).mkdir(parents=True, exist_ok=True)
    (Path(DEST_DIR)/"labels"/split).mkdir(parents=True, exist_ok=True)

all_samples = []
for c in classes:
    src_c = Path(SOURCE_DIR)/c
    if not src_c.exists():
        print(f"WARNING: Class folder missing: {src_c}")
        continue
    imgs = [p for p in src_c.iterdir() if p.suffix.lower() in [".jpg",".jpeg",".png"]]
    print(f"Found {len(imgs)} images in class '{c}'")
    all_samples.extend([(p, class_to_id[c]) for p in imgs])
print(f"Total images found: {len(all_samples)}")

random.shuffle(all_samples)
n_val = int(len(all_samples)*VAL_RATIO)
val_samples = all_samples[:n_val]
train_samples = all_samples[n_val:]

def process(samples, split):
    img_out_dir = Path(DEST_DIR)/"images"/split
    lbl_out_dir = Path(DEST_DIR)/"labels"/split
    print(f"Processing {len(samples)} samples for {split}...")
    for p, cid in samples:
        try:
            # copy image
            out_img = img_out_dir/p.name
            shutil.copy2(p, out_img)
            # create label file (full-image bbox)
            out_lbl = lbl_out_dir/(p.stem + ".txt")
            with open(out_lbl, "w", encoding="utf-8") as f:
                f.write(f"{cid} 0.5 0.5 1.0 1.0\n")
        except Exception as e:
            print(f"ERROR processing {p}: {e}")

process(train_samples, "train")
process(val_samples, "val")

# Write data.yaml
data_yaml = f"""path: {DEST_DIR.replace('\\','/')}
train: images/train
val: images/val
names: {list(classes)}
"""
with open(Path(DEST_DIR)/"data.yaml", "w", encoding="utf-8") as f:
    f.write(data_yaml)

print("Done. Detection dataset at:", DEST_DIR)
print("Wrote data.yaml with class names.")
