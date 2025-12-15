import React, { useState, useRef } from "react";
import {
  IonActionSheet,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonThumbnail,
  IonImg,
  IonSpinner,
  IonToast,
  IonList,
  IonReorder,
  IonReorderGroup,
  IonCard,
  IonCardContent,
  IonText,
} from "@ionic/react";
import { camera, images, close, shuffle, pencil, remove } from "ionicons/icons";
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
  const colorInputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
        <>
          <IonButton
            expand="block"
            fill="outline"
            onClick={() => setIsActionSheetOpen(true)}
            disabled={isLoading}
            className="photo-picker-button"
          >
            <IonIcon icon={camera} slot="start" />
            {isLoading ? "Processing..." : "Add Photo"}
            {isLoading && <IonSpinner name="crescent" />}
          </IonButton>

          {selectedPhoto && (
            <IonItem className="selected-photo-preview">
              <IonThumbnail slot="start">
                <IonImg src={selectedPhoto.webviewPath} />
              </IonThumbnail>
              <IonLabel>
                <h3>Photo Selected</h3>
                <p>Colors extracted successfully</p>
              </IonLabel>
            </IonItem>
          )}
        </>
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

            <div style={{ marginBottom: "16px", textAlign: "center" }}>
              <IonText>
                <h3 style={{ margin: "8px 0" }}>Extracted Colors</h3>
                <p style={{ fontSize: "14px", margin: "4px 0" }}>
                  Arrange and edit before confirming
                </p>
              </IonText>
            </div>

            <div style={{ marginBottom: "12px", textAlign: "center" }}>
              <IonButton fill="outline" size="small" onClick={handleShuffle}>
                <IonIcon icon={shuffle} slot="start" />
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
                      style={{
                        backgroundColor: color.hex,
                        height: "64px",
                        borderRadius: "8px",
                        border: "2px solid #ddd",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        margin: "8px 0",
                        userSelect: "none",
                        touchAction: "manipulation",
                        WebkitTouchCallout: "none",
                        position: "relative",
                      }}
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      <div
                        style={{
                          background: "rgba(0,0,0,0.7)",
                          color: "white",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          textAlign: "center",
                        }}
                      >
                        <div>{color.hex}</div>
                      </div>

                      {/* Edit Button */}
                      <IonButton
                        fill="clear"
                        size="small"
                        style={{
                          position: "absolute",
                          top: "4px",
                          left: "4px",
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          background: "white",
                          minHeight: "32px",
                          minWidth: "32px",
                          margin: 0,
                        }}
                        onClick={() => colorInputRefs.current[index]?.click()}
                      >
                        <IonIcon
                          slot="icon-only"
                          icon={pencil}
                          color="primary"
                          style={{ fontSize: "16px" }}
                        />
                      </IonButton>

                      {/* Remove Button */}
                      {extractedPalette.colors.length > 2 && (
                        <IonButton
                          fill="clear"
                          size="small"
                          color="danger"
                          style={{
                            position: "absolute",
                            top: "4px",
                            right: "4px",
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: "white",
                            minHeight: "32px",
                            minWidth: "32px",
                            margin: 0,
                          }}
                          onClick={() => handleColorRemove(index)}
                        >
                          <IonIcon
                            slot="icon-only"
                            icon={remove}
                            color="danger"
                            style={{ fontSize: "16px" }}
                          />
                        </IonButton>
                      )}

                      {/* Hidden Color Picker Input */}
                      <input
                        ref={(el) => {
                          colorInputRefs.current[index] = el;
                        }}
                        type="color"
                        value={color.hex}
                        onChange={(e) =>
                          handleColorUpdate(index, e.target.value)
                        }
                        style={{
                          position: "absolute",
                          opacity: 0,
                          width: "1px",
                          height: "1px",
                          pointerEvents: "none",
                        }}
                      />
                    </div>
                    <IonReorder slot="end" />
                  </IonItem>
                ))}
              </IonReorderGroup>
            </IonList>

            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <IonText color="medium">
                <p style={{ fontSize: "14px", margin: "8px 0" }}>
                  💡 Drag colors to reorder them. Tap the pencil to edit or X to
                  remove.
                </p>
              </IonText>
            </div>

            <div style={{ marginTop: "24px" }}>
              <IonButton
                expand="block"
                onClick={confirmPalette}
                disabled={extractedPalette.colors.length < 2}
              >
                Continue with {extractedPalette.colors.length} Colors
              </IonButton>
            </div>

            <div style={{ marginTop: "12px" }}>
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
