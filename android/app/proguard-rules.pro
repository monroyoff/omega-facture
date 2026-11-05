# ==============================================================================
# RÈGLES PROGUARD / R8 POUR OMEGA FACTURE (CAPACITOR 6 & GOOGLE PLAY OPTIMIZATION)
# ==============================================================================

# 1. Préservation du pont JavaScript / WebView de Capacitor (indispensable)
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# 2. Préservation des classes Bridge et Plugins de Capacitor
-keep public class com.getcapacitor.** { *; }
-keep public class * extends com.getcapacitor.Plugin { *; }
-keep public class * extends com.getcapacitor.BridgeActivity { *; }
-keep public class com.omegafacture.billing.MainActivity { *; }

# 3. Préservation des annotations Capacitor v3+
-keep @com.getcapacitor.annotation.CapacitorPlugin public class * {
    @com.getcapacitor.annotation.PermissionCallback <methods>;
    @com.getcapacitor.annotation.ActivityCallback <methods>;
    @com.getcapacitor.annotation.Permission <methods>;
    @com.getcapacitor.PluginMethod public <methods>;
}

-keep @com.getcapacitor.NativePlugin public class * {
    @com.getcapacitor.PluginMethod public <methods>;
}

# 4. Plugins Cordova (si utilisés par Capacitor)
-keep public class * extends org.apache.cordova.* {
    public <methods>;
    public <fields>;
}

# 5. Google Play Billing Client (Achats In-App & Abonnements)
-keep class com.android.billingclient.** { *; }
-keep interface com.android.billingclient.** { *; }

# 6. Méthodes natives JNI
-keepclasseswithmembernames class * {
    native <methods>;
}

# 7. Préservation des numéros de ligne et fichiers sources pour Google Play Console
# Permet à Google Play Console de dé-obfusquer les traces de pile (Crashlytics / Play Vitals)
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# 8. Préservation des annotations et métadonnées
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod

# 9. Supprimer les avertissements de dépendances manquantes non critiques
-dontwarn com.getcapacitor.**
-dontwarn org.apache.cordova.**
