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

import type { FriendDto } from "../../services/openapi/models/FriendDto";
import type { FriendDeviceDto } from "../../services/openapi/models/FriendDeviceDto";

interface Recipient {
  friendId: string;
  deviceId: string;
}

interface FriendSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToFriends: (recipients: Recipient[]) => void;
  isLoading?: boolean;
}

export const FriendSelector: React.FC<FriendSelectorProps> = ({
  isOpen,
  onClose,
  onSendToFriends,
  isLoading = false,
}) => {
  const [friends, setFriends] = useState<FriendDto[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [sendToSelf, setSendToSelf] = useState(false);
  const [userDevices, setUserDevices] = useState<FriendDeviceDto[]>([]);
  const [sendError, setSendError] = useState<string | null>(null);
  const { token, user } = useAuth();

  const loadFriends = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingFriends(true);
      // Use generated UsersService
      const { UsersService } = await import(
        "../../services/openapi/services/UsersService"
      );
      // Include devices when fetching friends for color palette sharing
      const friendsList = await UsersService.usersControllerGetFriends(true);
      console.log("Fetched friends with devices included:", friendsList);
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
      (async () => {
        if (user) {
          try {
            const { UsersService } = await import(
              "../../services/openapi/services/UsersService"
            );
            const userInfo = await UsersService.usersControllerGetUser(user.id);
            if (userInfo && Array.isArray(userInfo.devices)) {
              setUserDevices(userInfo.devices);
            } else {
              setUserDevices([]);
            }
          } catch (error) {
            console.error("Error loading user devices:", error);
            setUserDevices([]);
          }
        } else {
          setUserDevices([]);
        }
      })();
    }
  }, [isOpen, loadFriends, user]);

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleSend = () => {
    setSendError(null);
    const recipients: Recipient[] = [];

    // Add self if selected
    if (sendToSelf && user && userDevices.length > 0) {
      recipients.push({ friendId: user.id, deviceId: userDevices[0].id });
    }

    // Add selected friends
    selectedFriends.forEach((friendId) => {
      const friend = friends.find((f) => f.id === friendId);
      if (friend && friend.devices && friend.devices.length > 0) {
        recipients.push({ friendId, deviceId: friend.devices[0].id });
      } else {
        console.log("No devices available for friend:", friendId);
      }
    });

    if (recipients.length > 0) {
      onSendToFriends(recipients);
    } else {
      setSendError("Please select at least one recipient with a device.");
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
                {sendError && (
                  <IonText color="danger">
                    <p>{sendError}</p>
                  </IonText>
                )}
                <IonButton
                  expand="block"
                  onClick={handleSend}
                  disabled={isLoading}
                >
                  <IonIcon icon={send} slot="start" />
                  {isLoading
                    ? "Sending..."
                    : (() => {
                        const totalRecipients =
                          (sendToSelf ? 1 : 0) + selectedFriends.length;
                        if (totalRecipients === 0) return "Send";
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
