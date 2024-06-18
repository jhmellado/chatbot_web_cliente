import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

const $form = document.querySelector("form");
const $input = $form.querySelector("input");
const $message_template = document.querySelector("#message-template");
const $container = document.querySelector("main");
const $messages = $container.querySelector("ul");
const $loading = document.querySelector("small");
const $button = document.querySelector("button");

$button.setAttribute("disabled", true);

const SELECT_MODEL = "gemma-2b-it-q4f32_1-MLC";

let messages = [];

const engine = await CreateMLCEngine(SELECT_MODEL, {
  initProgressCallback: (info) => {
    console.log(info);
    $loading.textContent = `${info.text}`;
    if (info.progress === 1) {
      $button.removeAttribute("disabled");
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
  messages.push({ role: "user", content: message });

  const chunks = await engine.chat.completions.create({
    messages: messages,
    stream: true,
  });

  let reply = "";

  const $botMessage = addMessage("", "bot");

  for await (const chunk of chunks) {
    const [choice]  = chunk.choices
    console.log(chunk);
    reply += choice?.delta?.content ?? "";
    $botMessage.textContent = reply;
  }

  messages.push({ role: "assistant", content: reply });

  // const reply = await engine.chat.completions.create({
  //   messages: messages,
  // });

  // addMessage(reply.choices[0].message.content, "bot");
  // messages.push({
  //   role: "assistant",
  //   content: reply.choices[0].message.content,
  // }); https://youtu.be/HvoiF1MCPGs?si=GfRkpASUxP283kyi&t=4554

  console.log(messages);
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

  return $text;
}
