import React, { useState, useEffect } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonButton,
  IonRefresher,
  IonRefresherContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonToast,
  IonIcon,
  IonChip,
  IonSkeletonText,
  RefresherEventDetail,
} from "@ionic/react";
import { colorPalette, play, time, person } from "ionicons/icons";
import { MessageResponseDto } from "../services/openapi/models/MessageResponseDto";
import { MessagesService } from "../services/openapi/services/MessagesService";
import { useAuth } from "../hooks/useAuth";
import "./Messages.css";

const Messages: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [replayingMessageId, setReplayingMessageId] = useState<string | null>(
    null
  );
  const [toastMessage, setToastMessage] = useState<string>("");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const loadDataCallback = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const messagesData =
          await MessagesService.messagesControllerFindByRecipient(user.id);
        setMessages(messagesData);
      } catch (error) {
        console.error("Error loading data:", error);
        showMessage("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    loadDataCallback();
  }, [user]);

  const loadData = async () => {
    if (!user?.id) {
      return;
    }

    try {
      setLoading(true);
      const messagesData =
        await MessagesService.messagesControllerFindByRecipient(user.id);
      setMessages(messagesData);
    } catch (error) {
      console.error("Error loading data:", error);
      showMessage("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await loadData();
    event.detail.complete();
  };

  const replayMessage = async (messageId: string) => {
    try {
      setReplayingMessageId(messageId);
      const response = await MessagesService.messagesControllerReplayMessage(
        messageId
      );

      if (response.success) {
        showMessage(response.message || "Message replayed successfully!");
      } else {
        showMessage(response.message || "Failed to replay message");
      }
    } catch (error) {
      console.error("Error replaying message:", error);
      showMessage("Failed to replay message. Please try again.");
    } finally {
      setReplayingMessageId(null);
    }
  };

  const showMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderColorPalette = (colors: string[] | Array<{ hex: string }>) => {
    if (!colors || colors.length === 0) {
      return (
        <div className="color-palette-preview">
          <div className="empty-colors">No colors available</div>
        </div>
      );
    }

    return (
      <div className="color-palette-preview">
        {colors.slice(0, 6).map((color, index) => {
          // Handle both string format and object format {hex: string}
          let colorValue: string;
          if (typeof color === "string") {
            colorValue = color.startsWith("#") ? color : `#${color}`;
          } else if (color && typeof color === "object" && "hex" in color) {
            colorValue = color.hex;
          } else {
            colorValue = "#000000";
          }

          return (
            <div
              key={index}
              className="color-swatch"
              style={{ backgroundColor: colorValue }}
              title={colorValue}
            />
          );
        })}
        {colors.length > 6 && (
          <div className="color-count">+{colors.length - 6}</div>
        )}
      </div>
    );
  };

  const renderSkeletonLoader = () => (
    <IonList>
      {[1, 2, 3].map((i) => (
        <IonCard key={i}>
          <IonCardHeader>
            <IonSkeletonText
              animated
              style={{ width: "60%" }}
            ></IonSkeletonText>
          </IonCardHeader>
          <IonCardContent>
            <IonSkeletonText animated></IonSkeletonText>
            <IonSkeletonText
              animated
              style={{ width: "80%" }}
            ></IonSkeletonText>
          </IonCardContent>
        </IonCard>
      ))}
    </IonList>
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Color Messages</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {loading ? (
          renderSkeletonLoader()
        ) : messages.length === 0 ? (
          <div className="empty-state">
            <IonIcon icon={colorPalette} size="large" />
            <h2>No Color Messages</h2>
            <p>You haven't received any color palettes from friends yet.</p>
            <p>
              Ask your friends to send you some beautiful color combinations!
            </p>
          </div>
        ) : (
          <IonList>
            {messages.map((message) => (
              <IonCard key={message.id} className="message-card">
                <IonCardHeader>
                  <IonCardTitle>
                    <div className="message-header">
                      <div className="sender-info">
                        <IonIcon icon={person} />
                        <span>{message.sender.displayName}</span>
                      </div>
                      <div className="message-time">
                        <IonIcon icon={time} />
                        <span>{formatDate(message.sentAt)}</span>
                      </div>
                    </div>
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div className="message-content">
                    {renderColorPalette(message.colors)}

                    <div className="color-info">
                      <IonChip color="medium">
                        <IonIcon icon={colorPalette} />
                        <span>{message.colors.length} colors</span>
                      </IonChip>

                      {!message.deliveredAt && (
                        <IonChip color="warning">
                          <span>Undelivered</span>
                        </IonChip>
                      )}
                    </div>

                    <div className="message-actions">
                      <IonButton
                        expand="block"
                        fill="outline"
                        onClick={() => replayMessage(message.id)}
                        disabled={replayingMessageId === message.id}
                      >
                        <IonIcon icon={play} slot="start" />
                        {replayingMessageId === message.id
                          ? "Replaying..."
                          : "Show on Device"}
                      </IonButton>
                    </div>
                  </div>
                </IonCardContent>
              </IonCard>
            ))}
          </IonList>
        )}

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
        />
      </IonContent>
    </IonPage>
  );
};

export default Messages;
