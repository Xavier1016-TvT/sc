export default function TableScrollBody({
  children,
  className = '',
  tableClassName = 'w-full',
  height,
  variant = 'default',
}) {
  const classes = [
    'table-fixed-body',
    variant === 'red' && 'table-fixed-body-red',
    variant === 'modal' && 'table-fixed-body-modal',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const style = height
    ? { '--table-fixed-height': typeof height === 'number' ? `${height}px` : height }
    : undefined

  return (
    <div className={classes} style={style}>
      <table className={tableClassName}>{children}</table>
    </div>
  )
}
