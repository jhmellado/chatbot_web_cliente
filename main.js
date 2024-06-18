import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

const $form = document.querySelector("form");
const $input = $form.querySelector("input");
const $message_template = document.querySelector("#message-template");
const $container = document.querySelector("main");
const $messages = $container.querySelector("ul");
const $loading = document.querySelector("small");

const SELECT_MODEL = "gemma-2b-it-q4f32_1-MLC";

let messages = [];

const engine = await CreateMLCEngine(SELECT_MODEL, {
  initProgressCallback: (info) => {
    console.log(info);
    $loading.textContent = `${info.text}`;
    if (info.progress === 1) {
      $form.querySelector("button").disabled = false;
    }
  },
});

$form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = $input.value.trim();
  if (message.length) {
    $input.value = "";
  }
  addMessage(message, "user");

  const reply = await engine.chat.completions.create({
    messages: [...messages, { role: "user", content: message }],
    max_tokens: 100,
    temperature: 0.5,
  });

  addMessage(reply.choices[0].message.content, "bot");
  messages.push({ role: "user", content: message });
  messages.push({
    role: "assistant",
    content: reply.choices[0].message.content,
  });
});

function addMessage(text, sender) {
  const template = $message_template.content.cloneNode(true);
  const $message = template.querySelector("li.message");
  $message.classList.add(sender);
  const $who = $message.querySelector("span:first-child");
  $who.textContent = sender === "user" ? "Tú" : "GPT";

  const $text = $message.querySelector("span:last-child");
  $text.textContent = text;
  $messages.appendChild(template);

  $container.scrollTop = $container.scrollHeight;
}
