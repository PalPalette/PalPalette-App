import React, { useState, useEffect, useCallback } from "react";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonList,
  IonText,
  IonSpinner,
  IonSearchbar,
  IonAvatar,
  IonIcon,
} from "@ionic/react";
import { person, send } from "ionicons/icons";
import { useAuth } from "../../hooks/useContexts";

interface Friend {
  id: string;
  email: string;
  displayName: string;
}

interface FriendSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToFriends: (friendIds: string[]) => void;
  isLoading?: boolean;
}

export const FriendSelector: React.FC<FriendSelectorProps> = ({
  isOpen,
  onClose,
  onSendToFriends,
  isLoading = false,
}) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [sendToSelf, setSendToSelf] = useState(false);
  const { token, user } = useAuth();

  const loadFriends = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingFriends(true);
      // Use generated UsersService
      const { UsersService } = await import(
        "../../services/openapi/services/UsersService"
      );
      // The OpenAPI client should handle auth automatically if configured
      const friendsList = await UsersService.usersControllerGetFriends();
      setFriends(friendsList);
    } catch (error) {
      console.error("Error loading friends:", error);
    } finally {
      setLoadingFriends(false);
    }
  }, [token]);

  useEffect(() => {
    if (isOpen) {
      loadFriends();
    }
  }, [isOpen, loadFriends]);

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleSend = () => {
    const recipients: string[] = [];

    // Add self if selected
    if (sendToSelf && user) {
      recipients.push(user.id);
    }

    // Add selected friends
    recipients.push(...selectedFriends);

    if (recipients.length > 0) {
      onSendToFriends(recipients);
    }
  };

  const handleClose = () => {
    setSelectedFriends([]);
    setSearchText("");
    setSendToSelf(false);
    onClose();
  };

  const filteredFriends = friends.filter(
    (friend) =>
      friend.displayName.toLowerCase().includes(searchText.toLowerCase()) ||
      friend.email.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <IonModal isOpen={isOpen} onDidDismiss={handleClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Send to Friends</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleClose}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {loadingFriends ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "200px",
            }}
          >
            <IonSpinner name="crescent" />
          </div>
        ) : (
          <>
            {friends.length > 0 && (
              <IonSearchbar
                value={searchText}
                onIonInput={(e) => setSearchText(e.detail.value!)}
                placeholder="Search friends..."
                style={{ padding: "16px" }}
              />
            )}

            {friends.length === 0 ? (
              <>
                {/* Send to Self Option - Always available */}
                {user && (
                  <IonList>
                    <IonItem>
                      <IonLabel>
                        <h2>Send palette to:</h2>
                        <p>{sendToSelf ? "1" : "0"} selected</p>
                      </IonLabel>
                    </IonItem>

                    <IonItem
                      button
                      onClick={() => setSendToSelf(!sendToSelf)}
                      style={{
                        backgroundColor: sendToSelf
                          ? "var(--ion-color-primary-tint)"
                          : undefined,
                        borderLeft: sendToSelf
                          ? "4px solid var(--ion-color-primary)"
                          : "4px solid transparent",
                      }}
                    >
                      <IonAvatar slot="start">
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            backgroundColor: "var(--ion-color-success)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "18px",
                            fontWeight: "bold",
                          }}
                        >
                          {user.displayName.charAt(0).toUpperCase()}
                        </div>
                      </IonAvatar>

                      <IonLabel>
                        <h2>{user.displayName} (You)</h2>
                        <p>{user.email} • For testing</p>
                      </IonLabel>

                      <IonCheckbox
                        slot="end"
                        checked={sendToSelf}
                        onIonChange={() => setSendToSelf(!sendToSelf)}
                      />
                    </IonItem>
                  </IonList>
                )}

                <div
                  style={{
                    textAlign: "center",
                    padding: "48px 24px",
                    color: "var(--ion-color-medium)",
                  }}
                >
                  <IonIcon
                    icon={person}
                    style={{ fontSize: "64px", marginBottom: "16px" }}
                  />
                  <IonText>
                    <h3>No Friends Yet</h3>
                    <p>Add friends to start sharing color palettes!</p>
                    {user && (
                      <p style={{ marginTop: "16px" }}>
                        You can still send to yourself for testing.
                      </p>
                    )}
                  </IonText>
                </div>
              </>
            ) : (
              <IonList>
                <IonItem>
                  <IonLabel>
                    <h2>Select friends to send palette to:</h2>
                    <p>
                      {(sendToSelf ? 1 : 0) + selectedFriends.length} selected
                      {sendToSelf &&
                        selectedFriends.length > 0 &&
                        " (including yourself)"}
                      {sendToSelf &&
                        selectedFriends.length === 0 &&
                        " (yourself)"}
                    </p>
                  </IonLabel>
                </IonItem>

                {/* Send to Self Option */}
                {user && (
                  <IonItem
                    button
                    onClick={() => setSendToSelf(!sendToSelf)}
                    style={{
                      backgroundColor: sendToSelf
                        ? "var(--ion-color-primary-tint)"
                        : undefined,
                      borderLeft: sendToSelf
                        ? "4px solid var(--ion-color-primary)"
                        : "4px solid transparent",
                    }}
                  >
                    <IonAvatar slot="start">
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          backgroundColor: "var(--ion-color-success)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "18px",
                          fontWeight: "bold",
                        }}
                      >
                        {user.displayName.charAt(0).toUpperCase()}
                      </div>
                    </IonAvatar>

                    <IonLabel>
                      <h2>{user.displayName} (You)</h2>
                      <p>{user.email} • For testing</p>
                    </IonLabel>

                    <IonCheckbox
                      slot="end"
                      checked={sendToSelf}
                      onIonChange={() => setSendToSelf(!sendToSelf)}
                    />
                  </IonItem>
                )}

                {filteredFriends.map((friend) => (
                  <IonItem
                    key={friend.id}
                    button
                    onClick={() => toggleFriendSelection(friend.id)}
                  >
                    <IonAvatar slot="start">
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          backgroundColor: "var(--ion-color-primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "18px",
                          fontWeight: "bold",
                        }}
                      >
                        {friend.displayName.charAt(0).toUpperCase()}
                      </div>
                    </IonAvatar>

                    <IonLabel>
                      <h2>{friend.displayName}</h2>
                      <p>{friend.email}</p>
                    </IonLabel>

                    <IonCheckbox
                      slot="end"
                      checked={selectedFriends.includes(friend.id)}
                      onIonChange={() => toggleFriendSelection(friend.id)}
                    />
                  </IonItem>
                ))}
              </IonList>
            )}

            {(friends.length > 0 || user) && (
              <div style={{ padding: "16px" }}>
                <IonButton
                  expand="block"
                  onClick={handleSend}
                  disabled={
                    (selectedFriends.length === 0 && !sendToSelf) || isLoading
                  }
                >
                  <IonIcon icon={send} slot="start" />
                  {isLoading
                    ? "Sending..."
                    : (() => {
                        const totalRecipients =
                          (sendToSelf ? 1 : 0) + selectedFriends.length;
                        if (totalRecipients === 0) return "Select recipients";
                        if (totalRecipients === 1) {
                          if (sendToSelf && selectedFriends.length === 0)
                            return "Send to yourself";
                          return "Send to 1 friend";
                        }
                        if (sendToSelf && selectedFriends.length > 0) {
                          return `Send to ${selectedFriends.length} friend${
                            selectedFriends.length !== 1 ? "s" : ""
                          } + yourself`;
                        }
                        return `Send to ${selectedFriends.length} friend${
                          selectedFriends.length !== 1 ? "s" : ""
                        }`;
                      })()}
                </IonButton>
              </div>
            )}
          </>
        )}
      </IonContent>
    </IonModal>
  );
};
