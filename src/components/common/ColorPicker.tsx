import React, { useState, useRef } from "react";
import {
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonCard,
  IonCardContent,
  IonList,
  IonReorder,
  IonReorderGroup,
} from "@ionic/react";
import { add, remove, colorPalette, shuffle } from "ionicons/icons";
import { HexColorPicker } from "react-colorful";

interface ColorPickerProps {
  onColorsSelected: (colors: string[]) => void;
  maxColors?: number;
  minColors?: number;
  showConfirmButton?: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  onColorsSelected,
  maxColors = 6,
  minColors = 2,
  showConfirmButton = true,
}) => {
  const [colors, setColors] = useState<string[]>(["#FF5733", "#33FF57"]);
  const [customColor, setCustomColor] = useState("#3357FF");
  const colorInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [editingColorIndex, setEditingColorIndex] = useState<number | null>(
    null
  );
  const [pickerColor, setPickerColor] = useState("#FF5733");

  // Predefined color palette suggestions - more diverse and distinct colors
  const presetColors = [
    "#E63946", // Red
    "#F77F00", // Orange
    "#FCBF49", // Yellow
    "#06D6A0", // Mint
    "#118AB2", // Blue
    "#073B4C", // Dark Blue
    "#9D4EDD", // Purple
    "#FF006E", // Hot Pink
    "#8338EC", // Violet
    "#3A86FF", // Bright Blue
    "#FB5607", // Burnt Orange
    "#FFBE0B", // Golden Yellow
    "#06FFA5", // Neon Green
    "#1B9AAA", // Teal
    "#EF476F", // Pink Red
    "#FFD60A", // Bright Yellow
    "#06A77D", // Sea Green
    "#001845", // Navy
    "#D00000", // Crimson
    "#FCA311", // Amber
    "#14213D", // Dark Navy
    "#A7C957", // Lime
    "#F72585", // Magenta
    "#4CC9F0", // Sky Blue
  ];

  const addColor = (color?: string) => {
    if (colors.length >= maxColors) return;

    const newColor = color || customColor;
    if (!colors.includes(newColor)) {
      const newColors = [...colors, newColor];
      setColors(newColors);
      // Only call onColorsSelected if showConfirmButton is false (immediate mode)
      if (!showConfirmButton) {
        onColorsSelected(newColors);
      }
    }
  };

  const removeColor = (index: number) => {
    if (colors.length <= minColors) return;

    const newColors = colors.filter((_, i) => i !== index);
    setColors(newColors);
    // Only call onColorsSelected if showConfirmButton is false (immediate mode)
    if (!showConfirmButton) {
      onColorsSelected(newColors);
    }
  };

  const updateColor = (index: number, newColor: string) => {
    const newColors = [...colors];
    newColors[index] = newColor;
    setColors(newColors);
    // Only call onColorsSelected if showConfirmButton is false (immediate mode)
    if (!showConfirmButton) {
      onColorsSelected(newColors);
    }
  };

  const handleItemReorder = (event: CustomEvent) => {
    type ReorderDetail = { from: number; to: number; complete: () => void };
    const { from, to, complete } = (
      event as unknown as { detail: ReorderDetail }
    ).detail;
    const arr = [...colors];
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    setColors(arr);
    complete();

    // Only call onColorsSelected if showConfirmButton is false (immediate mode)
    if (!showConfirmButton) {
      onColorsSelected(arr);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...colors].sort(() => Math.random() - 0.5);
    setColors(shuffled);

    // Only call onColorsSelected if showConfirmButton is false (immediate mode)
    if (!showConfirmButton) {
      onColorsSelected(shuffled);
    }
  };

  const confirmSelection = () => {
    if (colors.length >= minColors) {
      onColorsSelected(colors);
    }
  };

  const isValidColor = (color: string) => {
    return /^#[0-9A-F]{6}$/i.test(color);
  };

  const openColorPicker = (index: number) => {
    setEditingColorIndex(index);
    setPickerColor(colors[index]);
  };

  const closeColorPicker = () => {
    setEditingColorIndex(null);
  };

  const saveColorFromPicker = () => {
    if (editingColorIndex !== null) {
      updateColor(editingColorIndex, pickerColor);
      setEditingColorIndex(null);
    }
  };

  const cancelColorEdit = () => {
    setEditingColorIndex(null);
  };

  return (
    <IonCard>
      <IonCardContent className="ion-padding-vertical">
        <div className="ion-text-center ion-margin-bottom">
          <IonIcon
            icon={colorPalette}
            style={{
              fontSize: "48px",
              color: "var(--ion-color-primary)",
            }}
          />
          <IonText>
            <h3 style={{ margin: "8px 0" }}>Create Custom Palette</h3>
            <p style={{ margin: "4px 0", fontSize: "14px" }}>
              Pick colors manually or choose from presets
            </p>
          </IonText>
        </div>

        {/* Current Colors */}
        <div className="ion-margin-bottom">
          <IonText>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>
              Your Colors ({colors.length}/{maxColors})
            </h4>
          </IonText>

          <div className="ion-text-center ion-margin-bottom">
            <IonButton fill="outline" onClick={handleShuffle}>
              <IonIcon icon={shuffle} slot="start" />
              Shuffle Colors
            </IonButton>
          </div>

          <IonList>
            <IonReorderGroup
              disabled={false}
              onIonItemReorder={handleItemReorder}
            >
              {colors.map((color, index) => (
                <IonItem key={`${color}-${index}`} lines="none">
                  <div
                    onClick={() => openColorPicker(index)}
                    style={{
                      backgroundColor: color,
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
                      <div>{color}</div>
                    </div>

                    {/* Remove Button */}
                    {colors.length > minColors && (
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
                          removeColor(index);
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
                <HexColorPicker color={pickerColor} onChange={setPickerColor} />
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

              <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
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
        </div>

        {/* Add Custom Color */}
        {colors.length < maxColors && (
          <div className="ion-margin-bottom">
            <IonItem>
              <IonLabel position="stacked">Add Custom Color</IonLabel>
              <IonInput
                value={customColor}
                placeholder="#3357FF"
                onIonInput={(e) => setCustomColor(e.detail.value!)}
                maxlength={7}
              />
              <IonButton
                slot="end"
                fill="clear"
                onClick={() => addColor()}
                disabled={
                  !isValidColor(customColor) || colors.includes(customColor)
                }
              >
                <IonIcon icon={add} />
              </IonButton>
            </IonItem>
          </div>
        )}

        {/* Preset Color Suggestions */}
        {colors.length < maxColors && (
          <div>
            <IonText>
              <h4 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>
                Quick Add
              </h4>
            </IonText>
            <IonGrid fixed>
              <IonRow>
                {presetColors
                  .filter((color) => !colors.includes(color))
                  .slice(0, 12)
                  .map((color, index) => (
                    <IonCol size="3" sizeSm="3" sizeMd="2" key={index}>
                      <div
                        onClick={() => addColor(color)}
                        style={{
                          backgroundColor: color,
                          height: "60px",
                          borderRadius: "8px",
                          border: "2px solid var(--ion-color-light)",
                          cursor: "pointer",
                          transition: "transform 0.2s ease",
                        }}
                        onMouseOver={(e) => {
                          (e.target as HTMLElement).style.transform =
                            "scale(1.05)";
                        }}
                        onMouseOut={(e) => {
                          (e.target as HTMLElement).style.transform =
                            "scale(1)";
                        }}
                      />
                    </IonCol>
                  ))}
              </IonRow>
            </IonGrid>
          </div>
        )}

        <div className="ion-margin-top">
          <IonText color="medium">
            <p style={{ fontSize: "13px", margin: "8px 0" }}>
              💡 Drag colors to reorder them. Tap a color to edit it or X to
              remove. Use presets below for quick selection. You need at least{" "}
              {minColors} colors and can have up to {maxColors}.
            </p>
          </IonText>
        </div>

        {/* Confirmation Button */}
        {showConfirmButton && (
          <div className="ion-margin-top">
            <IonButton
              expand="block"
              color="primary"
              onClick={confirmSelection}
              disabled={colors.length < minColors}
            >
              Continue with {colors.length} Color
              {colors.length !== 1 ? "s" : ""}
            </IonButton>
          </div>
        )}
      </IonCardContent>
    </IonCard>
  );
};
