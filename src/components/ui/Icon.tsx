interface IconProps {
  size?: number;
}

export const IconSettings = ({ size = 16 }: IconProps) => (
  <span style={{ fontSize: size, lineHeight: 1 }}>⚙</span>
);

export const IconPencil = ({ size = 16 }: IconProps) => (
  <span style={{ fontSize: size, lineHeight: 1 }}>✎</span>
);

export const IconTrash = ({ size = 16 }: IconProps) => (
  <span style={{ fontSize: size, lineHeight: 1 }}>✕</span>
);

export const IconPlus = ({ size = 16 }: IconProps) => (
  <span style={{ fontSize: size, lineHeight: 1 }}>+</span>
);

export const IconSearch = ({ size = 16 }: IconProps) => (
  <span style={{ fontSize: size, lineHeight: 1 }}>⌕</span>
);

export const IconClose = ({ size = 16 }: IconProps) => (
  <span style={{ fontSize: size, lineHeight: 1 }}>✕</span>
);

export const IconCopy = ({ size = 16 }: IconProps) => (
  <span style={{ fontSize: size, lineHeight: 1 }}>⧉</span>
);

export const IconCheck = ({ size = 16 }: IconProps) => (
  <span style={{ fontSize: size, lineHeight: 1 }}>✓</span>
);

export const IconChat = ({ size = 16 }: IconProps) => (
  <span style={{ fontSize: size, lineHeight: 1 }}>💬</span>
);
