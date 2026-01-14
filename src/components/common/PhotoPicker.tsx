import React, { useState, useRef } from "react";
import {
  IonActionSheet,
  IonButton,
  IonIcon,
  IonInput,
  IonSpinner,
  IonToast,
  IonList,
  IonReorder,
  IonReorderGroup,
  IonCard,
  IonCardContent,
  IonText,
  IonItem,
} from "@ionic/react";
import { camera, images, close, shuffle, remove } from "ionicons/icons";
import { HexColorPicker } from "react-colorful";
import { CameraService, CameraPhoto } from "../../services/CameraService";
import {
  ColorExtractionService,
  ColorPalette,
} from "../../services/ColorExtractionService";

interface PhotoPickerProps {
  onPaletteExtracted: (palette: ColorPalette) => void;
  onError?: (error: string) => void;
}

export const PhotoPicker: React.FC<PhotoPickerProps> = ({
  onPaletteExtracted,
  onError,
}) => {
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<CameraPhoto | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [extractedPalette, setExtractedPalette] = useState<ColorPalette | null>(
    null
  );
  const [editingColorIndex, setEditingColorIndex] = useState<number | null>(
    null
  );
  const [pickerColor, setPickerColor] = useState("#FF5733");
  const colorPickerRef = useRef<HTMLDivElement>(null);

  const showError = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    onError?.(message);
  };

  const extractColorsFromPhoto = async (
    photo: CameraPhoto,
    source: "camera" | "gallery"
  ) => {
    try {
      setIsLoading(true);

      // Convert photo to usable format for color extraction
      const imageUrl = await CameraService.photoToBase64(photo);
      if (!imageUrl) {
        throw new Error("Failed to process image");
      }

      // Extract color palette
      const palette = await ColorExtractionService.extractPalette(imageUrl, 6);
      if (!palette) {
        throw new Error("Failed to extract colors from image");
      }

      // Set the source
      palette.source = source;
      palette.imageUrl = imageUrl;

      // Store palette for editing instead of immediately returning it
      setExtractedPalette(palette);
      setSelectedPhoto(photo);
    } catch (error) {
      console.error("Error extracting colors:", error);
      showError("Failed to extract colors from image");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      setIsActionSheetOpen(false);
      const photo = await CameraService.takePhoto();

      if (photo) {
        await extractColorsFromPhoto(photo, "camera");
      } else {
        showError("Failed to take photo");
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      showError("Failed to access camera");
    }
  };

  const handleSelectFromGallery = async () => {
    try {
      setIsActionSheetOpen(false);
      const photo = await CameraService.selectFromGallery();

      if (photo) {
        await extractColorsFromPhoto(photo, "gallery");
      } else {
        showError("Failed to select photo");
      }
    } catch (error) {
      console.error("Error selecting photo:", error);
      showError("Failed to access gallery");
    }
  };

  const handleItemReorder = (event: CustomEvent) => {
    if (!extractedPalette) return;

    type ReorderDetail = { from: number; to: number; complete: () => void };
    const { from, to, complete } = (
      event as unknown as { detail: ReorderDetail }
    ).detail;
    const arr = [...extractedPalette.colors];
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);

    setExtractedPalette({
      ...extractedPalette,
      colors: arr,
    });
    complete();
  };

  const handleShuffle = () => {
    if (!extractedPalette) return;
    const shuffled = [...extractedPalette.colors].sort(
      () => Math.random() - 0.5
    );
    setExtractedPalette({
      ...extractedPalette,
      colors: shuffled,
    });
  };

  const handleColorUpdate = (index: number, newColor: string) => {
    if (!extractedPalette) return;

    const newColors = [...extractedPalette.colors];
    newColors[index] = {
      ...newColors[index],
      hex: newColor,
      rgb: hexToRgb(newColor),
    };

    setExtractedPalette({
      ...extractedPalette,
      colors: newColors,
    });
  };

  const openColorPicker = (index: number) => {
    setEditingColorIndex(index);
    setPickerColor(extractedPalette?.colors[index].hex || "#FF5733");

    // Scroll to color picker after a short delay to ensure it's rendered
    setTimeout(() => {
      colorPickerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 100);
  };

  const saveColorFromPicker = () => {
    if (editingColorIndex !== null) {
      handleColorUpdate(editingColorIndex, pickerColor);
      setEditingColorIndex(null);
    }
  };

  const cancelColorEdit = () => {
    setEditingColorIndex(null);
  };

  const handleColorRemove = (index: number) => {
    if (!extractedPalette || extractedPalette.colors.length <= 2) return;

    const newColors = extractedPalette.colors.filter((_, i) => i !== index);
    setExtractedPalette({
      ...extractedPalette,
      colors: newColors,
    });
  };

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

  const confirmPalette = () => {
    if (extractedPalette) {
      onPaletteExtracted(extractedPalette);
      // Reset state for next use
      setExtractedPalette(null);
      setSelectedPhoto(null);
    }
  };

  const startOver = () => {
    setExtractedPalette(null);
    setSelectedPhoto(null);
  };

  return (
    <>
      {!extractedPalette ? (
        <IonCard>
          <IonCardContent>
            <div className="ion-text-center ion-margin-bottom">
              <IonIcon
                icon={camera}
                style={{
                  fontSize: "48px",
                  color: "var(--ion-color-primary)",
                }}
              />
              <IonText>
                <h3 style={{ margin: "8px 0" }}>Extract from Photo</h3>
                <p style={{ margin: "4px 0", fontSize: "14px" }}>
                  Take a photo or select from gallery
                </p>
              </IonText>
            </div>

            <IonButton
              expand="block"
              onClick={() => setIsActionSheetOpen(true)}
              disabled={isLoading}
            >
              <IonIcon slot="start" icon={camera} />
              {isLoading ? "Processing..." : "Add Photo"}
              {isLoading && <IonSpinner slot="end" name="crescent" />}
            </IonButton>

            {selectedPhoto && (
              <div style={{ marginTop: "16px" }}>
                <img
                  src={selectedPhoto.webviewPath}
                  alt="Selected"
                  style={{
                    width: "100%",
                    maxHeight: "200px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "2px solid var(--ion-color-light)",
                  }}
                />
              </div>
            )}
          </IonCardContent>
        </IonCard>
      ) : (
        <IonCard>
          <IonCardContent>
            {extractedPalette.imageUrl && (
              <div style={{ marginBottom: "16px" }}>
                <img
                  src={extractedPalette.imageUrl}
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

            <div className="ion-text-center ion-margin-bottom">
              <IonText>
                <h3 style={{ margin: "8px 0" }}>Extracted Colors</h3>
                <p style={{ fontSize: "14px", margin: "4px 0" }}>
                  Arrange and edit before confirming
                </p>
              </IonText>
            </div>

            <div className="ion-text-center ion-margin-bottom">
              <IonButton fill="outline" onClick={handleShuffle}>
                <IonIcon slot="start" icon={shuffle} />
                Shuffle Colors
              </IonButton>
            </div>

            <IonList>
              <IonReorderGroup
                disabled={isLoading}
                onIonItemReorder={handleItemReorder}
              >
                {extractedPalette.colors.map((color, index) => (
                  <IonItem key={`${color.hex}-${index}`} lines="none">
                    <div
                      onClick={() => openColorPicker(index)}
                      style={{
                        backgroundColor: color.hex,
                        height: "80px",
                        borderRadius: "12px",
                        border:
                          editingColorIndex === index
                            ? "3px solid var(--ion-color-primary)"
                            : "2px solid var(--ion-color-light)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        margin: "8px 0",
                        userSelect: "none",
                        touchAction: "manipulation",
                        WebkitTouchCallout: "none",
                        position: "relative",
                        cursor: "pointer",
                        transition: "opacity 0.2s ease, border 0.2s ease",
                      }}
                      onContextMenu={(e) => e.preventDefault()}
                      onMouseOver={(e) => {
                        (e.currentTarget as HTMLElement).style.opacity = "0.8";
                      }}
                      onMouseOut={(e) => {
                        (e.currentTarget as HTMLElement).style.opacity = "1";
                      }}
                    >
                      <div
                        style={{
                          background: "rgba(0,0,0,0.7)",
                          color: "white",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontSize: "13px",
                          textAlign: "center",
                          fontWeight: "500",
                        }}
                      >
                        <div>{color.hex}</div>
                      </div>

                      {/* Remove Button */}
                      {extractedPalette.colors.length > 2 && (
                        <IonButton
                          fill="solid"
                          size="small"
                          color="danger"
                          style={{
                            position: "absolute",
                            top: "8px",
                            right: "8px",
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            minHeight: "40px",
                            minWidth: "40px",
                            margin: 0,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleColorRemove(index);
                          }}
                        >
                          <IonIcon
                            slot="icon-only"
                            icon={remove}
                            color="light"
                            style={{ fontSize: "18px" }}
                          />
                        </IonButton>
                      )}
                    </div>
                    <IonReorder slot="end" />
                  </IonItem>
                ))}
              </IonReorderGroup>
            </IonList>

            {/* Inline Color Picker */}
            {editingColorIndex !== null && (
              <div
                ref={colorPickerRef}
                style={{
                  marginTop: "20px",
                  padding: "16px",
                  borderRadius: "12px",
                  background: "rgba(var(--ion-color-primary-rgb), 0.05)",
                  border: "2px solid rgba(var(--ion-color-primary-rgb), 0.2)",
                }}
              >
                <IonText>
                  <h4 style={{ margin: "0 0 16px 0", fontSize: "14px" }}>
                    Edit Color
                  </h4>
                </IonText>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: "16px",
                  }}
                >
                  <HexColorPicker
                    color={pickerColor}
                    onChange={setPickerColor}
                  />
                </div>

                <div
                  style={{
                    backgroundColor: pickerColor,
                    height: "80px",
                    borderRadius: "8px",
                    border: "2px solid var(--ion-color-light)",
                    marginBottom: "16px",
                  }}
                />

                <IonInput
                  value={pickerColor}
                  placeholder="#000000"
                  onIonInput={(e) => setPickerColor(e.detail.value || "")}
                  maxlength={7}
                />

                <div
                  style={{ display: "flex", gap: "12px", marginTop: "16px" }}
                >
                  <IonButton
                    expand="block"
                    fill="outline"
                    onClick={cancelColorEdit}
                  >
                    Cancel
                  </IonButton>
                  <IonButton
                    expand="block"
                    color="primary"
                    onClick={saveColorFromPicker}
                  >
                    Save
                  </IonButton>
                </div>
              </div>
            )}

            <div className="ion-margin-top">
              <IonText color="medium">
                <p style={{ fontSize: "13px", margin: "8px 0" }}>
                  💡 Drag colors to reorder them. Tap a color to edit it or X
                  to remove. You need at least 2 colors.
                </p>
              </IonText>
            </div>

            <div className="ion-margin-top">
              <IonButton
                expand="block"
                color="primary"
                onClick={confirmPalette}
                disabled={extractedPalette.colors.length < 2}
              >
                Continue with {extractedPalette.colors.length} Color
                {extractedPalette.colors.length !== 1 ? "s" : ""}
              </IonButton>
            </div>

            <div className="ion-margin-top">
              <IonButton expand="block" fill="outline" onClick={startOver}>
                Start Over
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>
      )}

      <IonActionSheet
        isOpen={isActionSheetOpen}
        onDidDismiss={() => setIsActionSheetOpen(false)}
        header="Select Photo Source"
        buttons={[
          {
            text: "Take Photo",
            icon: camera,
            handler: handleTakePhoto,
          },
          {
            text: "Choose from Gallery",
            icon: images,
            handler: handleSelectFromGallery,
          },
          {
            text: "Cancel",
            icon: close,
            role: "cancel",
          },
        ]}
      />

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        color="danger"
      />
    </>
  );
};
