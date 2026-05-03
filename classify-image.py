import os
import json
import random


def generate_wishcraft_template_map(
    base_folder="public\wishcraft_templates",
    output_file="templateMap.json",
    max_images_per_category=7,
    premium_probability=0.35,
):
    """
    Scans template folders and creates a JSON map.

    Features:
    - Picks at most N images per category
    - Randomly assigns premium status
    - Generates frontend-ready JSON
    """

    template_map = []

    # Supported image formats
    valid_extensions = (
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
    )

    # Loop through categories
    for category in os.listdir(base_folder):

        category_path = os.path.join(
            base_folder,
            category
        )

        if not os.path.isdir(category_path):
            continue

        # Get images only
        images = [
            file
            for file in os.listdir(category_path)
            if file.lower().endswith(valid_extensions)
        ]

        # Shuffle randomly
        random.shuffle(images)

        # Limit image count
        selected_images = images[
            :max_images_per_category
        ]

        category_images = []

        for image_name in selected_images:

            # Random premium assignment
            is_premium = (
                random.random()
                < premium_probability
            )

            category_images.append({
                "src":
                    f"/wishcraft_templates/"
                    f"{category}/"
                    f"{image_name}",

                "premium": is_premium
            })

        # Format title nicely
        formatted_title = (
            category
            .replace("-", " ")
            .replace("_", " ")
            .title()
        )

        template_map.append({
            "title": formatted_title,
            "images": category_images
        })

    # Save JSON
    with open(output_file, "w") as json_file:

        json.dump(
            template_map,
            json_file,
            indent=2
        )

    print(
        f"\nTemplate map created:"
        f" {output_file}"
    )


# RUN FUNCTION
generate_wishcraft_template_map()