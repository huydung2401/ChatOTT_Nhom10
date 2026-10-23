import { Users } from 'lucide-react';
import { avatarColor, initials } from '../utils';

export default function Avatar({ name, seed, group = false, size = 44, online = false }) {
  const style = {
    width: size,
    height: size,
    fontSize: Math.round(size * 0.36),
    background: avatarColor(seed || name)
  };
  return (
    <span className="avatar" style={style} aria-hidden="true">
      {group ? <Users size={Math.round(size * 0.46)} /> : initials(name)}
      {online && <span className="avatar-dot" />}
    </span>
  );
}
