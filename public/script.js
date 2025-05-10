const form = document.querySelector("form");
const subBtn = document.querySelector("#input-text-submit-btn");
const result = document.querySelector(".output");
const speakBtn = document.querySelector(".speak-btn");
const inputElement = document.querySelector("textarea");
const textElements = [];
const audioElements = [];

subBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  subBtn.disabled = true;
  speakBtn.style.display = "none";
  const inputText = form["input-text"].value;
  if (inputText.length === 0) {
    alert("Give input Text First");
    subBtn.disabled = false;
    return;
  }
  try {
    result.innerHTML = "Generating...";
    const encodedInputText = encodeURIComponent(inputText);
    const response = await fetch(
      `/generate_output?input_text=${encodedInputText}`
    );
    if (response.ok) {
      result.innerHTML = "";
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
        }
      }
      setTimeout(() => {
        speakBtn.style.display = "block";
      }, 3000);
      for (let i = 0; i < textElements.length; i++) {
        let text = textElements[i].innerHTML;
        const audioResponse = await fetch(
          `/synthesize_audio?content=${encodeURIComponent(text)}`
        );
        if (audioResponse.ok) {
          const audioBlob = await audioResponse.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          audioElements.push(audio);
        } else {
          console.error("Failed to fetch audio for:", text);
        }
      }
    }
  } catch (error) {
    result.innerHTML = `Error ${error} occured`;
  }
  subBtn.disabled = false;
});

speakBtn.addEventListener("click", async () => {
  await new Promise((resolve) => {
    setTimeout(resolve, 1500);
  });
  for (let i = 0; i < audioElements.length; i++) {
    textElements[i].classList.add("highlight");
    await new Promise((resolve) => {
      audioElements[i].onended = resolve;
      audioElements[i].play();
    });
    textElements[i].classList.remove("highlight");
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
});

inputElement.addEventListener("input", () => {
  inputElement.style.overflowX = "hidden";
  inputElement.style.overflowX = "scroll";
  inputElement.rows = "3";
});
