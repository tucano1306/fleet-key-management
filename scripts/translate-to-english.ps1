# Script para traducir la aplicación completa a inglés

Write-Host "🌐 Translating application to English..." -ForegroundColor Cyan

# Definir reemplazos comunes
$translations = @{
    # General
    "Sistema de Gestión de Llaves" = "Fleet Key Management System"
    "Sistema para control y gestión de llaves de vehículos" = "Vehicle key management and control system"
    "Sistema de Llaves" = "Key Management System"
    "Gestión inteligente de flota" = "Intelligent Fleet Management"
    
    # Login/Auth
    "Iniciar Sesión" = "Log In"
    "Iniciar sesión" = "Log in"
    "Cerrar Sesión" = "Log Out"
    "Cerrar sesión" = "Log out"
    "Iniciando..." = "Logging in..."
    "Tipo de Usuario" = "User Type"
    "Chofer / Staff" = "Driver / Staff"
    "ID de Dispatch" = "Dispatch ID"
    "Últimos 4 Dígitos de Licencia" = "Last 4 Digits of License"
    "PIN de Seguridad" = "Security PIN"
    "¿Primera vez? Regístrate aquí" = "First time? Register here"
    "Por favor ingrese" = "Please enter"
    "y PIN" = "and PIN"
    "últimos 4 dígitos de licencia" = "last 4 digits of license"
    "Los últimos 4 dígitos de licencia deben ser exactamente 4 números" = "Last 4 digits of license must be exactly 4 numbers"
    "El PIN debe tener al menos 4 dígitos" = "PIN must be at least 4 digits"
    "Error al iniciar sesión" = "Login error"
    
    # Dashboard
    "Retiro Rápido" = "Quick Checkout"
    "Llaves" = "Keys"
    "Disponibles" = "Available"
    "Todas las Llaves" = "All Keys"
    "Mis Retiros Activos" = "My Active Checkouts"
    "Gestión de Llaves" = "Key Management"
    "Panel de Administración" = "Admin Panel"
    
    # Actions
    "Retirar" = "Check Out"
    "Devolver" = "Return"
    "Confirmar Retiro" = "Confirm Checkout"
    "Error al procesar el retiro" = "Error processing checkout"
    
    # Otros
    "Registradas" = "Registered"
    "No hay llaves registradas" = "No keys registered"
}

Write-Host "✅ Translation mapping loaded" -ForegroundColor Green
Write-Host "Translations will be applied during manual review" -ForegroundColor Yellow
