export const currencyFormatter = (value: number): string => {
  const formatter = Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  })

  return formatter.format(value)
}
