let gc_is_open = false;
let gc_initialized = false;
let current_reply = null;  // Dit houdt het bericht bij waar je op wilt reageren

function make_iframe() {
  const GlCHatplace = document.getElementById("global_chat_window");
  let current_profile = get_config().profile;
  let current_theme = get_theme(current_profile);
  let placeholderTextGlChat = (username_override == null) ? orig_name : username_override;
  
  const query_string = get_theme_as_query_string(current_theme, ["color_base00", "color_base01", "color_base02", "color_base03", "color_accent", "color_text"]);
  const replyParam = current_reply ? `&reply_to=${current_reply}` : '';  // Voeg de reply toe aan de querystring als er een reply is

  const GlCHatplaceHTML = `
    <iframe style="width:100%; height:100%; border:none" src='https://ldev.eu.org/smpp/gc/v1?placeholder=${placeholderTextGlChat}${query_string}${replyParam}'></iframe>
  `;
  GlCHatplace.innerHTML = GlCHatplaceHTML;
}

function make_gcwin(is_hidden) {
  const global_chat_window_element = document.createElement("div");
  global_chat_window_element.id = "global_chat_window";
  global_chat_window_element.classList.add("global_chat_window");
  
  if (is_hidden) {
    global_chat_window_element.classList.add("gc-hidden");
  }

  document.body.insertBefore(global_chat_window_element, document.body.childNodes[-1]);
  gc_is_open = false;
  
  document.addEventListener("click", function (e) {
    if (!gc_is_open) {
      return;
    }
    if (e.target.id == "global_chat_button") {
      return;
    }
    gc_close();
  });

  make_iframe();
}

function open_global_chat() {
  let win = document.getElementById("global_chat_window");
  if (win) {
    win.classList.remove("gc-hidden");
  } else {
    make_gcwin(false);
  }
  gc_initialized = true;
  gc_is_open = true;
}

function gc_close() {
  gc_is_open = false;
  let global_chat_window = document.getElementById("global_chat_window");
  global_chat_window.classList.add("gc-hidden");
}

function remove_gcwin() {
  let win = document.getElementById("global_chat_window");
  if (win) {
    win.remove();
  }
}

// Deze functie wordt aangeroepen wanneer de gebruiker op een bericht wil reageren
function reply_to_message(messageId) {
  current_reply = messageId;  // Zet het bericht waar je op wilt reageren
  open_global_chat();  // Open de chat, zodat je kunt reageren
}

// Optioneel: functie om de reply te resetten als de gebruiker klaar is met reageren
function reset_reply() {
  current_reply = null;
  open_global_chat();  // Heropen de chat zonder een reply
}
