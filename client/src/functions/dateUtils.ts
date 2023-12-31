export interface DatePair {
  monday: Date
  friday: Date
}

export function getMondayAndFriday(targetDate: Date = new Date()): DatePair {
  const monday = new Date(targetDate)
  monday.setDate(targetDate.getDate() - ((targetDate.getDay() + 6) % 7))

  const friday = new Date(monday)
  friday.setDate(monday.getDate() + 4)

  return {
    monday,
    friday,
  }
}

export function getMonthRange(monthsToRetrieve: number = 1): DatePair[] {
  const currentMonth = new Date().getMonth()
  const monthPairs: DatePair[] = []

  for (let i = -monthsToRetrieve; i <= monthsToRetrieve; i++) {
    const targetDate = new Date()
    targetDate.setMonth(currentMonth + i, 1)

    const firstMonday = getMondayAndFriday(targetDate)
    const lastFriday = getMondayAndFriday(new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0))

    let currentDate = new Date(firstMonday.monday)

    while (currentDate <= lastFriday.friday) {
      const { monday, friday } = getMondayAndFriday(currentDate)
      monthPairs.push({ monday, friday })

      currentDate.setDate(currentDate.getDate() + 7)
    }
  }
  return monthPairs
}

export function formatDateToDDMMYY(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  }
  return date.toLocaleDateString(undefined, options)
}
