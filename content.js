(function () {
    // Funktion, um die Sidebar zu erstellen
    function createSidebar() {
        // Sidebar-Container erstellen
        const sidebar = document.createElement('div');
        sidebar.id = 'chat-sidebar';
        sidebar.innerHTML = `
        <div id="chat-header">
          <span>Deepseekr1 Chat</span>
          <button id="chat-close">✕</button>
        </div>
        <div id="chat-body">
          <textarea id="inputText" placeholder="Deine Nachricht..."></textarea>
          <button id="sendButton">Senden</button>
          <div id="message-container">
            <pre id="temp" class="output">Antwort wird hier angezeigt...</pre>
          </div>
        </div>
        <div id="chat-resizer"></div>
      `;
        document.body.appendChild(sidebar);

        // Den Seiteninhalt anpassen: Margin-Right setzen, sodass der Inhalt verkleinert wird.
        const defaultWidth = sidebar.offsetWidth;
        document.body.style.marginRight = defaultWidth + 'px';

        // Schließen-Button: Sidebar entfernen und Seitenmargin zurücksetzen.
        document.getElementById('chat-close').addEventListener('click', function () {
            removeSidebar();
        });

        // API-Konfiguration
        //   const API_TOKEN = "";
        //   const API_URL = "https://openrouter.ai/api/v1/chat/completions";

        // Funktion, die den API-Request abschickt
        function sendRequest() {
            // Entferne alte temporäre Nachricht (falls vorhanden)
            const temp = document.getElementById('temp');
            if (temp) {
                temp.remove();
            }
            const messageContainer = document.getElementById('message-container');
            messageContainer.insertAdjacentHTML('beforeend', '<div class="spinner"></div>');
            const userMessage = document.getElementById('inputText').value.trim();
            if (!userMessage) {
                alert("Bitte gib eine Nachricht ein.");
                return;
            }

            fetch('https://quiet-limit-f8b1.alfred-narjes.workers.dev/', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "openai/gpt-3.5-turbo",
                    "messages": [{
                        "role": "user",
                        "content": userMessage
                    }]
                })
            })
                .then(response => response.json())
                .then(data => {
                    document.querySelectorAll('.spinner').forEach(e => e.remove());
                    // Hier wird marked genutzt, um Markdown in HTML umzuwandeln.
                    const result = marked.parse(data.choices[0].message.content);
                    messageContainer.insertAdjacentHTML('beforeend', '<pre class="output">' + result + '</pre>');
                })
                .catch(error => {
                    document.getElementById("message-container").insertAdjacentHTML('beforeend', '<pre class="output">Fehler bei der API-Anfrage: ' + error + '</pre>');
                });
        }

        // Event-Listener für den Senden-Button
        document.getElementById('sendButton').addEventListener('click', sendRequest);

        // Event-Listener für die Textarea: Enter (ohne Shift) sendet die Nachricht, Shift+Enter fügt einen Zeilenumbruch ein.
        const inputText = document.getElementById('inputText');
        inputText.addEventListener('keydown', function (event) {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendRequest();
            }
        });

        // Resizable Sidebar: Ermöglicht horizontales Ziehen
        const resizer = document.getElementById('chat-resizer');
        let isResizing = false;
        resizer.addEventListener('mousedown', function (e) {
            isResizing = true;
            document.body.style.cursor = 'ew-resize';
        });
        document.addEventListener('mousemove', function (e) {
            if (!isResizing) return;
            const newWidth = window.innerWidth - e.clientX;
            if (newWidth > 250 && newWidth < window.innerWidth * 0.8) {
                sidebar.style.width = newWidth + 'px';
                document.body.style.marginRight = newWidth + 'px';
            }
        });
        document.addEventListener('mouseup', function () {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = 'default';
            }
        });
    }

    // Funktion, um die Sidebar zu entfernen (falls vorhanden)
    function removeSidebar() {
        const sidebar = document.getElementById('chat-sidebar');
        if (sidebar) {
            sidebar.remove();
            document.body.style.marginRight = '0px';
        }
    }

    // Toggle-Funktion: Wenn die Sidebar existiert, entferne sie, andernfalls erstelle sie.
    function toggleSidebar() {
        const sidebar = document.getElementById('chat-sidebar');
        if (sidebar) {
            removeSidebar();
        } else {
            createSidebar();
        }
    }

    // Auf Nachrichten vom Background-Script reagieren (Toggle)
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "toggleSidebar") {
            toggleSidebar();
        }
    });
})();
