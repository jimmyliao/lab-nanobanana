# Nano Banana - 視覺 DNA 實驗室 (Jimmy's Lab)

這是一個由 **Nano Banana** 技術概念驅動的創意工作室 Web 應用程式。專為 IP 角色 **Jimmy** 設計，利用 Google Gemini API 實現角色的一致性生成、圖片編輯以及 Veo 影片動畫化。

## 📂 專案架構 (Project Structure)

本專案採用現代化的 React 架構，並使用 ES Modules (透過 `esm.sh`) 直接在瀏覽器中運行，無需繁雜的打包步驟 (No-build setup)，適合快速原型開發與部署。

```text
/
├── index.html                  # 應用程式入口點 (含 Import Maps 與 Tailwind CSS)
├── index.tsx                   # React 根組件掛載點
├── App.tsx                     # 主應用程式邏輯、狀態管理與路由導航
├── types.ts                    # TypeScript 型別定義
├── metadata.json               # 應用程式元數據與權限設定
├── GEMINI.md                   # 專案說明文件 (本文件)
│
├── services/
│   └── geminiService.ts        # Google GenAI SDK 整合 (生成、編輯、Veo 影片)
│
└── components/
    ├── ApiKeyInput.tsx         # API Key 輸入與驗證介面
    ├── CharacterGenerator.tsx  # "初始化 Jimmy" (文生圖) 組件
    ├── ImageEditor.tsx         # "Nano 編輯器" (圖生圖/編輯) 組件
    ├── VideoGenerator.tsx      # "Veo 動畫師" (圖生影) 組件
    └── Button.tsx              # 共用按鈕組件
```

## 🛠️ 技術堆疊 (Tech Stack)

*   **Frontend Framework**: React 19
*   **Styling**: Tailwind CSS (透過 CDN 載入)
*   **Icons**: Lucide React
*   **AI SDK**: Google GenAI SDK (`@google/genai`)
*   **Transpiler**: 瀏覽器原生 ES Modules (配合 HTML 中的 Import Maps)

## 🚀 如何在本機運行 (Local Development)

由於本專案依賴 `esm.sh` 下載模組，您只需要一個靜態檔案伺服器即可運行，**不需要** `npm install` 或 `npm run dev`。

1.  **下載所有檔案**：確保上述檔案結構完整保留。
2.  **啟動靜態伺服器**：
    *   **VS Code 使用者**：安裝 "Live Server" 擴充套件，右鍵點擊 `index.html` 選擇 "Open with Live Server"。
    *   **Python 使用者**：在專案目錄下執行 `python3 -m http.server 8000`。
    *   **Node.js 使用者**：安裝 `serve` (`npm install -g serve`) 並執行 `serve .`。
3.  **瀏覽器開啟**：打開 `http://localhost:8000` (或對應的連接埠)。

## 🌐 部署指南 (Deployment)

本應用程式是純靜態網站 (Client-side only)，可以免費部署到任何靜態網頁託管服務。

### 部署到 Vercel (推薦)
1.  將程式碼推送到 GitHub/GitLab/Bitbucket。
2.  在 Vercel 儀表板點擊 "Add New Project"。
3.  匯入您的儲存庫 (Repository)。
4.  **Framework Preset** 選擇 "Other"。
5.  點擊 **Deploy**。

### 部署到 Netlify
1.  將程式碼推送到 Git 儲存庫或直接拖曳資料夾到 Netlify Drop。
2.  確保 `index.html` 位於根目錄。
3.  發佈即可。

### 部署到 GitHub Pages
1.  建立一個 GitHub Repository 並上傳檔案。
2.  前往 Settings > Pages。
3.  Branch 選擇 `main` (或 `master`)，Folder 選擇 `/ (root)`。
4.  儲存後等待幾分鐘即可訪問。

## 🔑 API Key 安全說明

為了方便發佈與分享，本應用程式設計為**使用者自行輸入 API Key** (Bring Your Own Key) 的模式。

*   **儲存方式**：使用者輸入的 API Key 僅會儲存在使用者瀏覽器的 `LocalStorage` 中。
*   **安全性**：API Key **不會** 被傳送到 Nano Banana 的伺服器，而是直接從使用者的瀏覽器發送請求給 Google Gemini API。
*   **Veo 權限**：請注意，影片生成功能 (Veo) 需要該 API Key 綁定有計費功能的 Google Cloud Project。

## 📝 使用流程

1.  **輸入金鑰**：首次進入時，輸入您的 Gemini API Key。
2.  **DNA (生成)**：點擊 "初始化 Jimmy" 生成角色的標準形象。
3.  **編輯 (Edit)**：如果不滿意或想更換場景，切換到 "編輯" 分頁，上傳圖片並輸入修改指令。
4.  **Veo (動畫)**：將滿意的圖片下載或直接切換到 "Veo" 分頁，讓角色動起來。

---
*Powered by Google Gemini 2.5 Flash & Veo*
