export const MANUAL_SECTIONS = [
  {
    title: 'Getting Started',
    content: `
      <p>Adinusa AI requires the backend server to be running before use.</p>
      <ol>
        <li>Start the backend: <code>cd backend && npm run dev</code></li>
        <li>Verify it's running: <code>curl http://localhost:3002/health</code></li>
        <li>Open the chat panel with <kbd>Ctrl+Shift+A</kbd> or click the status bar item</li>
      </ol>
    `,
  },
  {
    title: 'Commands',
    content: `
      <table>
        <thead><tr><th>Command</th><th>Shortcut (Win/Linux)</th><th>Shortcut (Mac)</th><th>When</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td>Open Chat</td><td><kbd>Ctrl+Shift+A</kbd></td><td><kbd>Cmd+Shift+A</kbd></td><td>Always</td><td>Open the chat panel</td></tr>
          <tr><td>Ask</td><td><kbd>Ctrl+Shift+/</kbd></td><td><kbd>Cmd+Shift+/</kbd></td><td>Always</td><td>Quick question via input box</td></tr>
          <tr><td>Generate Code</td><td><kbd>Ctrl+Shift+G</kbd></td><td><kbd>Cmd+Shift+G</kbd></td><td>Editor focused</td><td>Generate code at cursor from a prompt</td></tr>
          <tr><td>Explain Selection</td><td><kbd>Ctrl+Shift+E</kbd></td><td><kbd>Cmd+Shift+E</kbd></td><td>Text selected</td><td>Explain selected code in plain language</td></tr>
          <tr><td>Fix Selection</td><td><kbd>Ctrl+Shift+F</kbd></td><td><kbd>Cmd+Shift+F</kbd></td><td>Text selected</td><td>Fix selected buggy code</td></tr>
          <tr><td>Switch AI Provider</td><td><kbd>Ctrl+Shift+P</kbd></td><td><kbd>Cmd+Shift+P</kbd></td><td>Outside editor/terminal</td><td>Switch between GLM-4, GPT-4, Claude, Gemini, Ollama</td></tr>
          <tr><td>Open Manual</td><td><kbd>Ctrl+Shift+M</kbd></td><td><kbd>Cmd+Shift+M</kbd></td><td>Always</td><td>Open this manual</td></tr>
        </tbody>
      </table>
      <p style="margin-top:10px;opacity:0.7;font-size:11px">All commands are also available via <strong>Command Palette</strong> (Ctrl+Shift+P) — search <em>Adinusa</em>. Explain, Fix, and Generate are also in the editor right-click context menu.</p>
    `,
  },
  {
    title: 'AI Providers',
    content: `
      <p>Switch providers anytime via <strong>Adinusa AI: Switch AI Provider</strong> in the Command Palette.</p>
      <table>
        <thead><tr><th>Provider</th><th>Models</th><th>API Key Required</th></tr></thead>
        <tbody>
          <tr><td>GLM-4 (default)</td><td>glm-4-flash, glm-4</td><td>Yes — <a href="https://open.bigmodel.cn">open.bigmodel.cn</a></td></tr>
          <tr><td>OpenAI</td><td>gpt-4o, gpt-4-turbo</td><td>Yes — <a href="https://platform.openai.com">platform.openai.com</a></td></tr>
          <tr><td>Claude</td><td>claude-3-5-sonnet, claude-3-opus</td><td>Yes — <a href="https://console.anthropic.com">console.anthropic.com</a></td></tr>
          <tr><td>Gemini</td><td>gemini-1.5-pro, gemini-1.5-flash</td><td>Yes — <a href="https://aistudio.google.com">aistudio.google.com</a></td></tr>
          <tr><td>Ollama</td><td>llama3, codellama, mistral</td><td>No — runs locally</td></tr>
        </tbody>
      </table>
    `,
  },
  {
    title: 'Agent Actions',
    content: `
      <p>When the AI needs to create files or run terminal commands, VS Code shows a confirmation prompt:</p>
      <pre>Adinusa AI wants to execute 2 action(s). Apply?   [Apply] [Skip]</pre>
      <ul>
        <li><strong>Apply</strong> — files are created and opened in the editor; commands run in a new terminal</li>
        <li><strong>Skip</strong> — actions are ignored, only the text reply is shown</li>
      </ul>
      <p>The AI will only write files or run commands when you explicitly ask it to (e.g. <em>"create a file"</em>, <em>"save this"</em>, <em>"run the tests"</em>).</p>
    `,
  },
  {
    title: 'Intent Guide',
    content: `
      <p>Adinusa AI detects your intent to decide whether to use tools or just reply with text.</p>
      <table>
        <thead><tr><th>What you want</th><th>Example prompt</th><th>Result</th></tr></thead>
        <tbody>
          <tr><td>Explanation only</td><td>"Explain this function"</td><td>Text reply, no file changes</td></tr>
          <tr><td>Code in chat</td><td>"Write a debounce function"</td><td>Code in reply, no file written</td></tr>
          <tr><td>Create a file</td><td>"Create a utils.ts file with a debounce function"</td><td>File written to disk</td></tr>
          <tr><td>Fix in place</td><td>"Fix this code and save it"</td><td>File overwritten with fix</td></tr>
          <tr><td>Run a command</td><td>"Run the tests"</td><td>Terminal command executed</td></tr>
        </tbody>
      </table>
    `,
  },
  {
    title: 'Configuration',
    content: `
      <p>Open VS Code Settings (<kbd>Ctrl+,</kbd>) and search <strong>Adinusa</strong>.</p>
      <table>
        <thead><tr><th>Setting</th><th>Default</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td>adinusaAi.backendUrl</td><td>http://localhost:3002</td><td>Backend server URL</td></tr>
          <tr><td>adinusaAi.provider</td><td>glm</td><td>Active LLM provider</td></tr>
          <tr><td>adinusaAi.glm.apiKey</td><td>—</td><td>Zhipu GLM API key</td></tr>
          <tr><td>adinusaAi.openai.apiKey</td><td>—</td><td>OpenAI API key</td></tr>
          <tr><td>adinusaAi.claude.apiKey</td><td>—</td><td>Anthropic API key</td></tr>
          <tr><td>adinusaAi.gemini.apiKey</td><td>—</td><td>Google Gemini API key</td></tr>
          <tr><td>adinusaAi.ollama.baseUrl</td><td>http://localhost:11434</td><td>Ollama server URL</td></tr>
        </tbody>
      </table>
    `,
  },
  {
    title: 'Troubleshooting',
    content: `
      <table>
        <thead><tr><th>Problem</th><th>Fix</th></tr></thead>
        <tbody>
          <tr><td>Backend not reachable</td><td>Run <code>cd backend && npm run dev</code> and check <code>http://localhost:3002/health</code></td></tr>
          <tr><td>No API key set</td><td>Use <strong>Switch AI Provider</strong> or set key in Settings (<kbd>Ctrl+,</kbd>)</td></tr>
          <tr><td>Rate limit error (429)</td><td>Wait 1 minute — limit is 30 requests/min per IP</td></tr>
          <tr><td>AI writes files unexpectedly</td><td>Avoid words like "create", "save", "write to file" unless you want file actions</td></tr>
          <tr><td>Ollama not responding</td><td>Ensure Ollama is running: <code>ollama serve</code></td></tr>
        </tbody>
      </table>
    `,
  },
];
