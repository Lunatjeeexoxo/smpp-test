let gc_is_open = false;
let gc_initialized = false;
let gc_last_message_time = 0; // Toegevoegd: variabele voor cooldown

const COOLDOWN_TIME = 3000; // Cooldown van 3 seconden (in milliseconden)

function make_iframe() {
  const GlCHatplace = document.getElementById("global_chat_window");
  let current_profile = get_config().profile;
  let current_theme = get_theme(current_profile);

  let placeholderTextGlChat = username_override || orig_name;

  const query_string = get_theme_as_query_string(
    current_theme,
    ["color_base00", "color_base01", "color_base02", "color_base03", "color_accent", "color_text"]
  );

  const GlCHatplaceHTML = `
    <iframe style="width:100%; height:100%; border:none" src='https://ldev.eu.org/smpp/gc/v1?placeholder=${placeholderTextGlChat}${query_string}'></iframe>
  `;
  GlCHatplace.innerHTML = GlCHatplaceHTML;
}

function make_gcwin(is_hidden) {
  global_chat_window_element = document.createElement("div");
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

// Functie om cooldown te controleren
function canSendMessage() {
  const currentTime = Date.now();
  if (currentTime - gc_last_message_time >= COOLDOWN_TIME) {
    gc_last_message_time = currentTime; // Update laatste berichttijd
    return true;
  } else {
    alert(`Wacht a.u.b. ${COOLDOWN_TIME / 1000} seconden voordat je een nieuw bericht verzendt.`);
    return false;
  }
}

// Voeg de cooldown-check toe aan je berichtverstuur-logica
function sendMessage(message) {
  if (canSendMessage()) {
    // Logica om bericht te versturen
    console.log("Bericht verzonden:", message);
    // Plaats hier jouw code voor het daadwerkelijke verzenden van het bericht
  }
}
