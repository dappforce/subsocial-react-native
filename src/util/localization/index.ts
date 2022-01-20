import { NativeModules, Platform } from 'react-native'
import { init } from '@kiruse/l10n'
import enUS from './enUS'

const locales = {
  en: enUS,
  'en-US': enUS,
}

const strings = init<typeof enUS>()
  .addLocales(locales)
  .setLocale(getSystemLocale() as keyof typeof locales)
  .strings;
export default strings;

function getSystemLocale(): string {
  if (Platform.OS === 'android') {
    return NativeModules.I18nManager.localeIdentifier
  }
  if (Platform.OS === 'ios') {
    return NativeModules.SettingsManager.settings.AppleLocale ||
      NativeModules.SettingsManager.settings.AppleLanguages[0]
  }
  return 'en'
}
