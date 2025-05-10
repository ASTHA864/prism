const form = document.querySelector("form");
const subBtn = document.querySelector("#input-text-submit-btn");
const result = document.querySelector(".output");
const textElements = []
const audioElements = []

subBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  const inputText = form["input-text"].value;
  if (inputText.length === 0) {
    alert("Give input Text First");
    return ;
  }
  try {
    const encodedInputText = encodeURIComponent(inputText);
    const response = await fetch(
      `/generate_output?input_text=${encodedInputText}`
    );
    if (response.ok) {
      const data = await response.json();
      const responseArray = data.content;
      for (let i = 0; i < responseArray.length; i++) {
        let element = responseArray[i].trim();
        let isHeading = element.startsWith("[Heading]");
        let textElement = isHeading
          ? document.createElement("h2")
          : document.createElement("p");
        let text = isHeading
          ? element.replace("[Heading]", "")
          : element.replace("[Paragraph]", "");
        text = text.trim();
        if (text.length > 0) {
          textElement.innerHTML = text;
          result.appendChild(textElement);
          textElements.push(textElement);
            const audioResponse = await fetch(`/synthesize_audio?content=${encodeURIComponent(text)}`);
            if (audioResponse.ok) {
            const audioBlob = await audioResponse.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            AudioElements.push(audioElement);
            } else {
            console.error("Failed to fetch audio for:", text);
            }
        }
      }

    }
  } catch (error) {
    result.innerHTML = `Error ${error} occured`
  }
});
