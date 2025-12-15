import React, { useState } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonToast,
  IonSpinner,
  IonCard,
  IonCardContent,
  IonText,
  IonChip,
  IonLabel,
  IonSegment,
  IonSegmentButton,
} from "@ionic/react";
import { send, camera, brush } from "ionicons/icons";
import { PhotoPicker } from "../components/common";
import { ColorPicker } from "../components/common/ColorPicker";
import { FriendSelectorEnhanced } from "../components/common/FriendSelectorEnhanced";
import {
  ColorPalette,
  ExtractedColor,
} from "../services/ColorExtractionService";
import { useAuth } from "../hooks/useContexts";

type CreationMode = "photo" | "manual";

const PaletteCreator: React.FC = () => {
  const { user } = useAuth();
  const [creationMode, setCreationMode] = useState<CreationMode>("photo");
  const [currentPalette, setCurrentPalette] = useState<ColorPalette | null>(
    null
  );
  const [showFriendSelector, setShowFriendSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState<"success" | "danger">("success");

  const showMessage = (
    message: string,
    color: "success" | "danger" = "success"
  ) => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const handlePaletteExtracted = (palette: ColorPalette) => {
    setCurrentPalette(palette);
    showMessage("Palette ready! Review and send to friends!");
  };

  const handleManualColorsSelected = (colors: string[]) => {
    const extractedColors: ExtractedColor[] = colors.map((hex) => ({
      hex,
      rgb: hexToRgb(hex),
      name: getColorName(hex),
    }));

    // Find the most vibrant color as dominant
    const dominantColor = extractedColors[0] || extractedColors[0];

    setCurrentPalette({
      colors: extractedColors,
      dominantColor,
      source: "gallery", // Use gallery as closest match for manual
      imageUrl: undefined, // No image for manual palettes
    });
    showMessage("Palette ready! Review and send to friends!");
  };

  // Helper function to convert hex to RGB as tuple
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : [0, 0, 0];
  };

  // Simple color name approximation
  const getColorName = (hex: string) => {
    const rgb = hexToRgb(hex);
    const [r, g, b] = rgb;
    if (r > g && r > b) return "Red-ish";
    if (g > r && g > b) return "Green-ish";
    if (b > r && b > g) return "Blue-ish";
    if (r > 200 && g > 200 && b > 200) return "Light";
    if (r < 50 && g < 50 && b < 50) return "Dark";
    return "Mixed";
  };

  const handleSendToFriends = async (friendIds: string[]) => {
    if (!user) {
      showMessage("Please login to send palettes", "danger");
      return;
    }

    if (!currentPalette) {
      showMessage("No palette to send", "danger");
      return;
    }

    try {
      setIsLoading(true);

      // Use the enhanced API to send palette to friends
      const { UsersService } = await import(
        "../services/openapi/services/UsersService"
      );

      await UsersService.usersControllerSendPaletteToFriends({
        friendIds: friendIds,
        colors: currentPalette.colors.map((color) => color.hex),
        imageUrl:
          currentPalette.source === "camera"
            ? currentPalette.imageUrl
            : undefined,
      });

      showMessage(
        `Palette sent to ${friendIds.length} recipient${
          friendIds.length !== 1 ? "s" : ""
        }!`
      );

      setTimeout(() => {
        setCurrentPalette(null);
        setShowFriendSelector(false);
      }, 2000);
    } catch (error) {
      console.error("Error sending palette:", error);
      showMessage("Failed to send palette", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  // Note: Enhanced friendIds-only sender removed (unused) to avoid lint warnings.

  const copyColorToClipboard = async (color: ExtractedColor) => {
    try {
      await navigator.clipboard.writeText(color.hex);
      showMessage(`Copied ${color.hex} to clipboard`);
    } catch (error) {
      console.error("Failed to copy color:", error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Share Colors</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div style={{ padding: "16px" }}>
          {!currentPalette ? (
            <div className="empty-state">
              {/* Mode Selection */}
              <IonCard>
                <IonCardContent
                  style={{ textAlign: "center", padding: "24px" }}
                >
                  <IonText>
                    <h2>🎨 Create Color Palette</h2>
                    <p>Choose how you want to create your palette</p>
                  </IonText>

                  <IonSegment
                    value={creationMode}
                    onIonChange={(e) =>
                      setCreationMode(e.detail.value as CreationMode)
                    }
                    style={{ marginTop: "16px", marginBottom: "24px" }}
                  >
                    <IonSegmentButton value="photo">
                      <IonIcon icon={camera} />
                      <IonLabel>From Photo</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="manual">
                      <IonIcon icon={brush} />
                      <IonLabel>Pick Colors</IonLabel>
                    </IonSegmentButton>
                  </IonSegment>

                  {creationMode === "photo" ? (
                    <div>
                      <IonIcon
                        icon={camera}
                        style={{
                          fontSize: "64px",
                          color: "var(--ion-color-primary)",
                          marginBottom: "16px",
                        }}
                      />
                      <IonText>
                        <h3>Extract from Photo</h3>
                        <p>
                          Take a photo or select one from your gallery to
                          extract colors and send them to your friends' devices.
                        </p>
                      </IonText>

                      <div style={{ marginTop: "24px" }}>
                        <PhotoPicker
                          onPaletteExtracted={handlePaletteExtracted}
                          onError={(error) => showMessage(error, "danger")}
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <ColorPicker
                        onColorsSelected={handleManualColorsSelected}
                        maxColors={6}
                        minColors={2}
                      />
                    </div>
                  )}
                </IonCardContent>
              </IonCard>
            </div>
          ) : (
            <div className="palette-editor">
              <IonCard>
                <IonCardContent>
                  {currentPalette.imageUrl && (
                    <div style={{ marginBottom: "16px" }}>
                      <img
                        src={currentPalette.imageUrl}
                        alt="Source"
                        style={{
                          width: "100%",
                          maxHeight: "200px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    </div>
                  )}

                  <div style={{ marginBottom: "16px", textAlign: "center" }}>
                    <IonText>
                      <h3>Your Color Palette</h3>
                      <p
                        style={{
                          fontSize: "14px",
                          color: "var(--ion-color-medium)",
                        }}
                      >
                        {currentPalette.colors.length} colors ready to send
                      </p>
                    </IonText>
                  </div>

                  {/* Color Preview Grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(80px, 1fr))",
                      gap: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    {currentPalette.colors.map((color, index) => (
                      <div
                        key={`${color.hex}-${index}`}
                        style={{
                          backgroundColor: color.hex,
                          height: "80px",
                          borderRadius: "8px",
                          border: "2px solid #ddd",
                          display: "flex",
                          alignItems: "flex-end",
                          justifyContent: "center",
                          padding: "8px",
                        }}
                      >
                        <div
                          style={{
                            background: "rgba(0,0,0,0.7)",
                            color: "white",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            textAlign: "center",
                          }}
                        >
                          {color.hex}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Color Chips for copying */}
                  <div style={{ marginTop: "16px" }}>
                    <IonText>
                      <p
                        style={{
                          fontSize: "14px",
                          fontWeight: "bold",
                          marginBottom: "8px",
                        }}
                      >
                        Tap to copy hex codes:
                      </p>
                    </IonText>
                    {currentPalette.colors.map((color, index) => (
                      <IonChip
                        key={`chip-${color.hex}-${index}`}
                        style={{
                          backgroundColor: color.hex,
                          color: "white",
                          margin: "4px",
                        }}
                        onClick={() => copyColorToClipboard(color)}
                      >
                        <IonLabel>{color.hex}</IonLabel>
                      </IonChip>
                    ))}
                  </div>

                  <div style={{ marginTop: "24px" }}>
                    <IonButton
                      expand="block"
                      onClick={() => setShowFriendSelector(true)}
                      disabled={isLoading}
                    >
                      <IonIcon icon={send} slot="start" />
                      Send to Friends
                    </IonButton>
                  </div>

                  <div style={{ marginTop: "12px" }}>
                    <IonButton
                      expand="block"
                      fill="outline"
                      onClick={() => setCurrentPalette(null)}
                    >
                      Start Over
                    </IonButton>
                  </div>
                </IonCardContent>
              </IonCard>

              <IonText
                color="medium"
                style={{ fontSize: "14px", marginTop: "16px" }}
              >
                <p>
                  💡 Review your palette and tap chips to copy hex codes. When
                  ready, send it to your friends!
                </p>
              </IonText>
            </div>
          )}
        </div>

        <FriendSelectorEnhanced
          isOpen={showFriendSelector}
          onClose={() => setShowFriendSelector(false)}
          onSendToFriends={handleSendToFriends}
          isLoading={isLoading}
          title="Send Palette to Friends"
          includeUserSelf={true}
        />

        {isLoading && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
          >
            <IonSpinner name="crescent" color="primary" />
          </div>
        )}

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
        />
      </IonContent>
    </IonPage>
  );
};

export default PaletteCreator;
