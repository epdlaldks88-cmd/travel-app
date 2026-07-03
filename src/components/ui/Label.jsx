/**
 * Label
 *
 * Props:
 *   htmlFor  - 연결할 input id
 *   required - true 면 * 표시
 */

export default function Label({
  htmlFor,
  required = false,
  className = '',
  children,
  ...rest
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={[
        'block text-sm font-medium text-text mb-1.5',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
      {required && <span className="text-danger ml-0.5">*</span>}
    </label>
  );
}
