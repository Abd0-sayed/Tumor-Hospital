import React, { useEffect, useState } from "react";

function ShowImage() {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    fetch("https://tumorhospital.runasp.net/api/Test")
      .then((response) => response.json())
      .then((data) => {
        // data is an array of image URLs
        const thirdImage = data[2]; // index 2 = third item
        setImageUrl(thirdImage);
      })
      .catch((error) => console.error("Error:", error));
  }, []);

  return (
    <div>
      {imageUrl && <img src={imageUrl} alt="Third item" width="300" />}
    </div>
  );
}

export default ShowImage;
