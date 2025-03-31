const chatBody = document.querySelector(".chat-body");
const messageIntput = document.querySelector(".message-input");
const sentMessage = document.querySelector("#sent-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWapper = document.querySelector(".upload-file-wapper");
const fileClose = document.querySelector("#file-cancel");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot");

const API_KEY = "AIzaSyBQPWQ8LAOuTLLgZZ_ea7Qb0CyuqIuOxDE";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

const user = {
  message: null,
  file: {
    data: null,
    mime_type: null,
  },
};

const chatHistory = [];
let enterPressed = 0;

const generateBotResponse = async (incomingMessageDiv) => {
  const messageElement = incomingMessageDiv.querySelector(".message-text");
  chatHistory.push({
    role: "user",
    parts: [
      { text: user.message },
      ...(user.file.data ? [{ inline_data: user.file }] : []),
    ],
  });
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: chatHistory,
    }),
  };
  try {
    const res = await fetch(API_URL, requestOptions);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error.message);
    }

    const botResponseText = data.candidates[0].content.parts[0].text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .trim();
    messageElement.innerText = botResponseText;
    chatHistory.push({
      role: "model",
      parts: [{ text: botResponseText }],
    });
  } catch (error) {
    console.log(error);
  } finally {
    user.file = {};
    incomingMessageDiv.classList.remove("thinking");
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
  }
};

const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

const handleOutGoingMessage = (e) => {
  e.preventDefault();

  user.message = messageIntput.value.trim();
  messageIntput.value = "";
  fileUploadWapper.classList.remove("file-uploaded");

  const messageContent = ` <div class="message-text"></div>
  ${
    user.file.data
      ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" alt="file" class="attachment" />`
      : ""
  }`;
  const OutGoingMessageDiv = createMessageElement(
    messageContent,
    "user-message"
  );
  OutGoingMessageDiv.querySelector(".message-text").textContent = user.message;
  chatBody.appendChild(OutGoingMessageDiv);

  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

  setTimeout(() => {
    const messageContent = ` <svg
    class="bot-avatar"
    xmlns="http://www.w3.org/2000/svg"
    width="50"
    height="50"
    viewBox="0 0 1024 1024"
    >
    <path
    d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"
    ></path>
    </svg>
    <div class="message-text">
            <div class="thinking">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          </div>`;
    const incomingMessageDiv = createMessageElement(
      messageContent,
      "bot-message",
      "thinking"
    );

    chatBody.appendChild(incomingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
    generateBotResponse(incomingMessageDiv);
  }, 600);
};

messageIntput.addEventListener("keydown", (e) => {
  const userMessage = e.target.value.trim();
  if (e.key === "Enter" && userMessage) {
    enterPressed++;

    if (enterPressed === 2) {
      handleOutGoingMessage(e);
      enterPressed = 0;
    }
  }
});

sentMessage.addEventListener("click", (e) => handleOutGoingMessage(e));

fileInput.addEventListener("change", (e) => {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    fileUploadWapper.querySelector("img").src = e.target.result;
    fileUploadWapper.classList.add("file-uploaded");
    const base64String = e.target.result.split(",")[1];
    user.file = {
      data: base64String,
      mime_type: file.type,
    };
  };
  reader.readAsDataURL(file);
});

fileClose.addEventListener("click", () => {
  user.file = {};
  fileUploadWapper.classList.remove("file-uploaded");
});

document
  .querySelector("#file-upload")
  .addEventListener("click", (e) => fileInput.click());

chatbotToggler.addEventListener("click", () => {
  document.body.classList.toggle("show-chatbot");
});

closeChatbot.addEventListener("click", () => {
  document.body.classList.remove("show-chatbot");
});
