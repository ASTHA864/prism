const form = document.querySelector("form");
const subBtn = document.querySelector("#input-text-submit-btn");
const result = document.querySelector(".output");
var responseArray = [];

subBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  const inputText = form["input-text"].value;
  if (inputText.length === 0) {
    alert("Give input Text First");
  }
  try {
    const encodedInputText = encodeURIComponent(inputText);
    const response = await fetch(
      `/generate_output?input_text=${encodedInputText}`
    );
    if (response.ok) {
      const data = await response.json();
      responseArray = data.content;
      responseArray.forEach((element) => {
        const textElement = document.createElement("p");
        textElement.innerHTML = element;
        result.appendChild(textElement);
      });
    }
  } catch (error) {
    console.log(error);
  }
});
