$definition = @"
using System;
using System.Runtime.InteropServices;
public class WinKeyboard {
    [DllImport("user32.dll", SetLastError = true)]
    public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);

    public const uint KEYEVENTF_KEYUP = 0x0002;

    public static void PressKey(byte vk) {
        keybd_event(vk, 0, 0, UIntPtr.Zero);
        keybd_event(vk, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
    }
}
"@
Add-Type -TypeDefinition $definition
[WinKeyboard]::PressKey(0x7B) # F12
Write-Output "KEY_SENT_OK"
