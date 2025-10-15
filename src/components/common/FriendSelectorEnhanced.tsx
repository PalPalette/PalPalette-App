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
  IonBadge,
} from "@ionic/react";
import { person, send, checkmarkCircle, alertCircle } from "ionicons/icons";
import { useAuth } from "../../hooks/useContexts";
import type { FriendDto } from "../../services/openapi/models/FriendDto";

interface FriendSelectorEnhancedProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToFriends: (friendIds: string[]) => void;
  isLoading?: boolean;
  title?: string;
  includeUserSelf?: boolean;
}

export const FriendSelectorEnhanced: React.FC<FriendSelectorEnhancedProps> = ({
  isOpen,
  onClose,
  onSendToFriends,
  isLoading = false,
  title = "Send to Friends",
  includeUserSelf = true,
}) => {
  const [friends, setFriends] = useState<FriendDto[]>([]);
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [sendToSelf, setSendToSelf] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadFriends = useCallback(async () => {
    try {
      setLoadingFriends(true);
      const { UsersService } = await import(
        "../../services/openapi/services/UsersService"
      );
      const friendsList = await UsersService.usersControllerGetFriends(true);
      console.log("Fetched friends with devices included:", friendsList);
      setFriends(friendsList);
    } catch (error) {
      console.error("Error loading friends:", error);
    } finally {
      setLoadingFriends(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadFriends();
    }
  }, [isOpen, loadFriends]);

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriendIds((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleSend = () => {
    setSendError(null);
    const recipientFriendIds: string[] = [];

    // Add self if selected and user exists
    if (sendToSelf && user && includeUserSelf) {
      recipientFriendIds.push(user.id);
    }

    // Add selected friends
    recipientFriendIds.push(...selectedFriendIds);

    // Filter out friends without devices
    const friendsWithDevices = friends.filter(
      (f) =>
        selectedFriendIds.includes(f.id) && f.devices && f.devices.length > 0
    );

    const friendsWithoutDevices = selectedFriendIds.filter(
      (fId) =>
        !friends.find((f) => f.id === fId && f.devices && f.devices.length > 0)
    );

    if (friendsWithoutDevices.length > 0) {
      setSendError(
        `Some friends don't have devices available: ${friendsWithoutDevices.length} friend(s)`
      );
    }

    if (recipientFriendIds.length > 0 && friendsWithDevices.length > 0) {
      onSendToFriends(selectedFriendIds); // Send only friends with devices
    } else if (recipientFriendIds.length === 0) {
      setSendError("Please select at least one recipient.");
    } else {
      setSendError("Selected friends don't have any devices available.");
    }
  };

  const handleClose = () => {
    setSelectedFriendIds([]);
    setSearchText("");
    setSendToSelf(false);
    setSendError(null);
    onClose();
  };

  const filteredFriends = friends.filter(
    (friend) =>
      friend.displayName.toLowerCase().includes(searchText.toLowerCase()) ||
      friend.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const getFriendDeviceStatus = (friend: FriendDto) => {
    if (!friend.devices || friend.devices.length === 0) {
      return { hasDevices: false, deviceCount: 0, status: "No devices" };
    }
    return {
      hasDevices: true,
      deviceCount: friend.devices.length,
      status: `${friend.devices.length} device${
        friend.devices.length !== 1 ? "s" : ""
      }`,
    };
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={handleClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{title}</IonTitle>
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

            <IonList>
              <IonItem>
                <IonLabel>
                  <h2>Select friends to send to:</h2>
                  <p>
                    {(sendToSelf && includeUserSelf ? 1 : 0) +
                      selectedFriendIds.length}{" "}
                    selected
                    {sendToSelf &&
                      selectedFriendIds.length > 0 &&
                      " (including yourself)"}
                    {sendToSelf &&
                      selectedFriendIds.length === 0 &&
                      includeUserSelf &&
                      " (yourself)"}
                  </p>
                </IonLabel>
              </IonItem>

              {/* Send to Self Option */}
              {user && includeUserSelf && (
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

              {/* Friends List */}
              {filteredFriends.map((friend) => {
                const deviceStatus = getFriendDeviceStatus(friend);
                const isSelected = selectedFriendIds.includes(friend.id);

                return (
                  <IonItem
                    key={friend.id}
                    button
                    onClick={() => toggleFriendSelection(friend.id)}
                    style={{
                      backgroundColor: isSelected
                        ? "var(--ion-color-primary-tint)"
                        : undefined,
                      borderLeft: isSelected
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
                          backgroundColor: deviceStatus.hasDevices
                            ? "var(--ion-color-primary)"
                            : "var(--ion-color-medium)",
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
                      <p>
                        {friend.email}
                        <IonBadge
                          color={
                            deviceStatus.hasDevices ? "success" : "warning"
                          }
                          style={{ marginLeft: "8px" }}
                        >
                          <IonIcon
                            icon={
                              deviceStatus.hasDevices
                                ? checkmarkCircle
                                : alertCircle
                            }
                            style={{ marginRight: "4px", fontSize: "12px" }}
                          />
                          {deviceStatus.status}
                        </IonBadge>
                      </p>
                    </IonLabel>

                    <IonCheckbox
                      slot="end"
                      checked={isSelected}
                      onIonChange={() => toggleFriendSelection(friend.id)}
                    />
                  </IonItem>
                );
              })}

              {friends.length === 0 && !loadingFriends && (
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
                    <p>Add friends to start sharing!</p>
                    {user && includeUserSelf && (
                      <p style={{ marginTop: "16px" }}>
                        You can still send to yourself for testing.
                      </p>
                    )}
                  </IonText>
                </div>
              )}
            </IonList>

            {/* Send Button */}
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
                        (sendToSelf && includeUserSelf ? 1 : 0) +
                        selectedFriendIds.length;
                      if (totalRecipients === 0) return "Send";
                      if (totalRecipients === 1) {
                        if (
                          sendToSelf &&
                          selectedFriendIds.length === 0 &&
                          includeUserSelf
                        )
                          return "Send to yourself";
                        return "Send to 1 friend";
                      }
                      if (
                        sendToSelf &&
                        selectedFriendIds.length > 0 &&
                        includeUserSelf
                      ) {
                        return `Send to ${selectedFriendIds.length} friend${
                          selectedFriendIds.length !== 1 ? "s" : ""
                        } + yourself`;
                      }
                      return `Send to ${selectedFriendIds.length} friend${
                        selectedFriendIds.length !== 1 ? "s" : ""
                      }`;
                    })()}
              </IonButton>
            </div>
          </>
        )}
      </IonContent>
    </IonModal>
  );
};
