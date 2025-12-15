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
import { add, remove, colorPalette, pencil, shuffle } from "ionicons/icons";

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

  return (
    <IonCard>
      <IonCardContent>
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
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
        <div style={{ marginBottom: "20px" }}>
          <IonText>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>
              Your Colors ({colors.length}/{maxColors})
            </h4>
          </IonText>

          <div style={{ marginBottom: "12px", textAlign: "center" }}>
            <IonButton fill="outline" size="small" onClick={handleShuffle}>
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
                    style={{
                      backgroundColor: color,
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
                      <div>{color}</div>
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
                    {colors.length > minColors && (
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
                        onClick={() => removeColor(index)}
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
                      value={color}
                      onChange={(e) => updateColor(index, e.target.value)}
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
        </div>

        {/* Add Custom Color */}
        {colors.length < maxColors && (
          <div style={{ marginBottom: "20px" }}>
            <IonItem>
              <IonLabel position="stacked">Add Custom Color</IonLabel>
              <IonInput
                value={customColor}
                placeholder="#3357FF"
                onIonInput={(e) => setCustomColor(e.detail.value!)}
                maxlength={7}
                style={{ fontSize: "16px" }}
              />
              <IonButton
                slot="end"
                fill="clear"
                onClick={() => addColor()}
                disabled={
                  !isValidColor(customColor) || colors.includes(customColor)
                }
                style={{ minHeight: "44px", minWidth: "44px" }}
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
            <IonGrid style={{ padding: "0" }}>
              <IonRow>
                {presetColors
                  .filter((color) => !colors.includes(color))
                  .slice(0, 12)
                  .map((color, index) => (
                    <IonCol
                      size="4"
                      sizeMd="3"
                      sizeLg="2"
                      key={index}
                      style={{ padding: "4px" }}
                    >
                      <div
                        onClick={() => addColor(color)}
                        style={{
                          backgroundColor: color,
                          height: "44px",
                          borderRadius: "6px",
                          border: "2px solid #ddd",
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

        <div style={{ marginTop: "16px", textAlign: "center" }}>
          <IonText color="medium">
            <p style={{ fontSize: "14px", margin: "8px 0" }}>
              💡 Drag colors to reorder them. Tap the pencil to edit or X to
              remove. Use presets below for quick selection. You need at least{" "}
              {minColors} colors and can have up to {maxColors}.
            </p>
          </IonText>
        </div>

        {/* Confirmation Button */}
        {showConfirmButton && (
          <div style={{ marginTop: "20px", textAlign: "center" }}>
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
