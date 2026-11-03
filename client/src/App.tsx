import React from "react";
// 引入组件
import Chat, { Bubble, useMessages } from "@chatui/core";
// 引入样式
import "@chatui/core/dist/index.css";
import "./App.css";

const initialMessages = [
  {
    type: "system",
    content: { text: "基于 ChatUI 对话容器的 AI 助手" },
  },
  {
    type: "text",
    content: { text: "Hi，有什么可以帮你的吗" },
    user: {
      avatar: "",
    },
  },
];

const defaultQuickReplies = [
  {
    icon: "message",
    name: "人工",
    isNew: true,
    isHighlight: true,
  },
];

const App = () => {
  const { messages, appendMsg, updateMsg } = useMessages(initialMessages);

  /**
   * 用户发送消息时触发的回调消息
   * @param type
   * @param val
   */
  async function handleSend(type, val) {
    if (type === "text" && val.trim()) {
      // 先将用户输入的消息追加到右侧聊天窗口
      appendMsg({
        type: "text",
        content: { text: val },
        position: "right",
      });

      // 预先在左侧添加一个空白消息，用于后续接收助手流式返回的内容
      const assistantMsgId = appendMsg({
        type: "text",
        content: { text: "" },
        position: "left",
      });

      try {
        // 向后端发送 POST 请求，开启 SEE 流式响应
        const response = await fetch("http://localhost:3000/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question: val }),
        });

        if (!response.ok || !response.body) {
          throw new Error("Network response was not ok");
        }

        const reader = response.body.getReader(); // 读取响应流
        const decoder = new TextDecoder(); // 文本解码器
        let accumulatedText = ""; // 用于累积助手返回的文本内容

        // 辅助函数：将流式返回的新文本追加到已有内容，并更新消息显示
        function updateAssistantMessage(newText: string) {
          accumulatedText += newText;
          updateMsg(assistantMsgId, {
            type: "text",
            content: { text: accumulatedText },
            position: "left",
          });
        }

        // 循环读取流式响应，逐块解码并处理数据
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          // SSE 格式数据每行以 data: 开头，拆分并逐行处理
          const lines = chunk.split("\n").filter((line) => line.trim());

          for (const line of lines) {
            if (line.startsWith("data:")) {
              const data = line.slice(6); // 提取 data 后的内容
              updateAssistantMessage(data); // 更新助手消息内容
            }
          }
        }
      } catch (error) {
        console.log("Stream error:", error);
      }
    }
  }

  /**
   * 点击快捷短语时触发的回调
   * @param item 快捷短语对象
   */
  function handleQuickReplyClick(item) {
    handleSend("text", item.name);
  }

  /**
   * 根据消息类型渲染对应内容
   * @param msg 消息对象
   */
  function renderMessageContent(msg) {
    const { type, content } = msg;
    switch (type) {
      case "text":
        return <Bubble content={content.text} />;
      case "image":
        return (
          <Bubble type="image">
            <img src={content.picUrl} alt="" />
          </Bubble>
        );
      default:
        return null;
    }
  }

  return (
    <Chat
      navbar={{ title: "AI 助理" }}
      messages={messages}
      renderMessageContent={renderMessageContent}
      quickReplies={defaultQuickReplies}
      onQuickReplyClick={handleQuickReplyClick}
      onSend={handleSend}
    />
  );
};

export default App;
