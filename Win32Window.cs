using System;
using System.Runtime.InteropServices;
using System.Text;

namespace Win32WindowApp
{
    class Program
    {
        // Window Constants
        private const int CS_VREDRAW = 0x0001;
        private const int CS_HREDRAW = 0x0002;
        private const int WS_OVERLAPPEDWINDOW = 0x00CF0000;
        private const int WS_CHILD = 0x40000000;
        private const int WS_VISIBLE = 0x10000000;
        private const int WS_EX_CLIENTEDGE = 0x00000200;
        private const int WS_EX_STATICEDGE = 0x00020000;
        private const int WS_EX_LAYERED = 0x00080000;
        private const int LWA_ALPHA = 0x00000002;
        private const int BS_PUSHBUTTON = 0x00000000;
        private const int BS_DEFPUSHBUTTON = 0x00000001;
        private const int BS_GROUPBOX = 0x00000007;
        private const int SS_LEFT = 0x00000000;
        private const int ES_LEFT = 0x00000000;
        private const int ES_AUTOHSCROLL = 0x0080;
        private const int CW_USEDEFAULT = unchecked((int)0x80000000);
        private const int SW_SHOW = 5;
        private const int WM_DESTROY = 0x0002;
        private const int WM_PAINT = 0x000F;
        private const int WM_COMMAND = 0x0111;
        private const int WM_CTLCOLORSTATIC = 0x0138;
        private const int WM_CTLCOLORBTN = 0x0135;
        private const int COLOR_WINDOW = 5;
        private const int COLOR_BTNFACE = 15;
        private const int IDC_ARROW = 32512;
        private const int IDC_OPENFILE = 1001;
        private const int IDC_SAVEFILE = 1002;
        private const int IDC_CHOOSECOLOR = 1003;
        private const int IDC_PICKICON = 1004;
        private const int IDC_USEOLDSTYLE = 1005;
        private const int BS_AUTOCHECKBOX = 0x00000003;
        private const int BM_GETCHECK = 0x00F0;
        private const int BM_SETCHECK = 0x00F1;
        private const int BST_CHECKED = 1;
        private const int OFN_PATHMUSTEXIST = 0x00000800;
        private const int OFN_FILEMUSTEXIST = 0x00001000;
        private const int OFN_NOCHANGEDIR = 0x00000008;
        private const int OFN_ENABLEHOOK = 0x00000020;  // Forces old-style dialog (see https://devblogs.microsoft.com/oldnewthing/20180917-00/?p=99745)
        private const int MAX_PATH = 260;
        private const int CC_RGBINIT = 0x00000001;
        private const int CC_ENABLEHOOK = 0x00000010;   // Forces old-style color dialog (same pattern as OPENFILENAME)

        // Delegates
        private delegate IntPtr WndProc(IntPtr hWnd, uint msg, IntPtr wParam, IntPtr lParam);
        private delegate uint OFNHookProc(IntPtr hWnd, uint msg, IntPtr wParam, IntPtr lParam);
        private delegate IntPtr CCHookProc(IntPtr hwnd, uint uMsg, IntPtr wParam, IntPtr lParam);

        // Structures
        [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
        private struct WNDCLASSEX
        {
            public uint cbSize;
            public uint style;
            public IntPtr lpfnWndProc;
            public int cbClsExtra;
            public int cbWndExtra;
            public IntPtr hInstance;
            public IntPtr hIcon;
            public IntPtr hCursor;
            public IntPtr hbrBackground;
            public string lpszMenuName;
            public string lpszClassName;
            public IntPtr hIconSm;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct MSG
        {
            public IntPtr hwnd;
            public uint message;
            public IntPtr wParam;
            public IntPtr lParam;
            public uint time;
            public POINT pt;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct POINT
        {
            public int X;
            public int Y;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct PAINTSTRUCT
        {
            public IntPtr hdc;
            public bool fErase;
            public RECT rcPaint;
            public bool fRestore;
            public bool fIncUpdate;
            [MarshalAs(UnmanagedType.ByValArray, SizeConst = 32)]
            public byte[] rgbReserved;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct RECT
        {
            public int Left;
            public int Top;
            public int Right;
            public int Bottom;
        }

        [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
        private struct OPENFILENAME
        {
            public int lStructSize;
            public IntPtr hwndOwner;
            public IntPtr hInstance;
            public string lpstrFilter;
            public string lpstrCustomFilter;
            public int nMaxCustFilter;
            public int nFilterIndex;
            public string lpstrFile;
            public int nMaxFile;
            public string lpstrFileTitle;
            public int nMaxFileTitle;
            public string lpstrInitialDir;
            public string lpstrTitle;
            public int Flags;
            public short nFileOffset;
            public short nFileExtension;
            public string lpstrDefExt;
            public IntPtr lCustData;
            public IntPtr lpfnHook;
            public string lpTemplateName;
        }

        [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
        private struct CHOOSECOLOR
        {
            public int lStructSize;
            public IntPtr hwndOwner;
            public IntPtr hInstance;
            public uint rgbResult;
            public IntPtr lpCustColors;
            public int Flags;
            public IntPtr lCustData;
            public IntPtr lpfnHook;
            public IntPtr lpTemplateName;  // LPCWSTR when template used; we pass IntPtr.Zero
        }

        // Win32 API Functions
        [DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
        private static extern ushort RegisterClassEx([In] ref WNDCLASSEX lpwcx);

        [DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
        private static extern IntPtr CreateWindowEx(
            uint dwExStyle,
            string lpClassName,
            string lpWindowName,
            uint dwStyle,
            int x,
            int y,
            int nWidth,
            int nHeight,
            IntPtr hWndParent,
            IntPtr hMenu,
            IntPtr hInstance,
            IntPtr lpParam);

        [DllImport("user32.dll")]
        private static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

        [DllImport("user32.dll")]
        private static extern bool UpdateWindow(IntPtr hWnd);

        [DllImport("user32.dll")]
        private static extern bool GetMessage(out MSG lpMsg, IntPtr hWnd, uint wMsgFilterMin, uint wMsgFilterMax);

        [DllImport("user32.dll")]
        private static extern bool TranslateMessage([In] ref MSG lpMsg);

        [DllImport("user32.dll")]
        private static extern IntPtr DispatchMessage([In] ref MSG lpMsg);

        [DllImport("user32.dll")]
        private static extern void PostQuitMessage(int nExitCode);

        [DllImport("user32.dll")]
        private static extern IntPtr DefWindowProc(IntPtr hWnd, uint uMsg, IntPtr wParam, IntPtr lParam);

        [DllImport("kernel32.dll", CharSet = CharSet.Unicode)]
        private static extern IntPtr GetModuleHandle(string lpModuleName);

        [DllImport("user32.dll", SetLastError = true)]
        private static extern IntPtr LoadCursor(IntPtr hInstance, int lpCursorName);

        [DllImport("user32.dll")]
        private static extern IntPtr BeginPaint(IntPtr hWnd, out PAINTSTRUCT lpPaint);

        [DllImport("user32.dll")]
        private static extern bool EndPaint(IntPtr hWnd, [In] ref PAINTSTRUCT lpPaint);

        [DllImport("gdi32.dll", CharSet = CharSet.Unicode)]
        private static extern bool TextOut(IntPtr hdc, int x, int y, string lpString, int c);

        [DllImport("uxtheme.dll", CharSet = CharSet.Unicode)]
        private static extern int SetWindowTheme(IntPtr hWnd, string pszSubAppName, string pszSubIdList);

        [DllImport("gdi32.dll")]
        private static extern IntPtr CreateSolidBrush(uint color);

        [DllImport("comdlg32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
        private static extern bool GetOpenFileName(ref OPENFILENAME ofn);

        [DllImport("comdlg32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
        private static extern bool GetSaveFileName(ref OPENFILENAME ofn);

        [DllImport("comdlg32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
        private static extern bool ChooseColor(ref CHOOSECOLOR lpcc);

        [DllImport("shell32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
        private static extern int PickIconDlg(IntPtr hwnd, StringBuilder pszIconPath, uint cchIconPath, ref int piIconIndex);

        [DllImport("user32.dll", CharSet = CharSet.Unicode)]
        private static extern int MessageBox(IntPtr hWnd, string text, string caption, uint type);

        [DllImport("user32.dll")]
        private static extern IntPtr GetDlgItem(IntPtr hDlg, int nIDDlgItem);

        [DllImport("user32.dll")]
        private static extern IntPtr SendMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);

        [DllImport("user32.dll", SetLastError = true)]
        private static extern bool SetLayeredWindowAttributes(IntPtr hwnd, uint crKey, byte bAlpha, int dwFlags);

        [DllImport("user32.dll", SetLastError = true)]
        private static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);

        [DllImport("user32.dll", SetLastError = true)]
        private static extern int SetWindowRgn(IntPtr hWnd, IntPtr hRgn, bool bRedraw);

        [DllImport("gdi32.dll")]
        private static extern IntPtr CreateRoundRectRgn(int x1, int y1, int x2, int y2, int widthEllipse, int heightEllipse);

        [DllImport("gdi32.dll")]
        private static extern bool DeleteObject(IntPtr hObject);

        private static WndProc delegateWndProc = MyWndProc;
        private static OFNHookProc ofnHookProc = OfnHookProc;
        private static CCHookProc ccHookProc = CCHookProcStub;

        private static uint OfnHookProc(IntPtr hWnd, uint msg, IntPtr wParam, IntPtr lParam)
        {
            return 0; // Let the dialog handle everything; we only use the hook to force old-style UI
        }

        private static IntPtr CCHookProcStub(IntPtr hwnd, uint uMsg, IntPtr wParam, IntPtr lParam)
        {
            return IntPtr.Zero; // Let the dialog handle everything; we only use the hook to force old-style UI
        }

        /// <summary>Applies old-style (Win 3.1) look to any OPENFILENAME-based dialog (Open or Save).</summary>
        private static void ApplyOldStyleToOpenFileName(ref OPENFILENAME ofn)
        {
            ofn.Flags |= OFN_ENABLEHOOK;
            ofn.lpfnHook = Marshal.GetFunctionPointerForDelegate(ofnHookProc);
        }

        /// <summary>Applies old-style look to the ChooseColor dialog (CC_ENABLEHOOK).</summary>
        private static void ApplyOldStyleToChooseColor(ref CHOOSECOLOR cc)
        {
            cc.Flags |= CC_ENABLEHOOK;
            cc.lpfnHook = Marshal.GetFunctionPointerForDelegate(ccHookProc);
        }

        private static bool UseOldStyleDialogs(IntPtr hWndOwner)
        {
            IntPtr hCheck = GetDlgItem(hWndOwner, IDC_USEOLDSTYLE);
            if (hCheck == IntPtr.Zero) return true;
            return SendMessage(hCheck, BM_GETCHECK, IntPtr.Zero, IntPtr.Zero).ToInt32() == BST_CHECKED;
        }

        static void Main(string[] args)
        {
            Console.WriteLine("Creating Classic Win32 Window...");

            IntPtr hInstance = GetModuleHandle(null);
            string className = "MyWindowClass";

            // Register Window Class
            WNDCLASSEX wndClass = new WNDCLASSEX
            {
                cbSize = (uint)Marshal.SizeOf(typeof(WNDCLASSEX)),
                style = CS_HREDRAW | CS_VREDRAW,
                lpfnWndProc = Marshal.GetFunctionPointerForDelegate(delegateWndProc),
                cbClsExtra = 0,
                cbWndExtra = 0,
                hInstance = hInstance,
                hIcon = IntPtr.Zero,
                hCursor = LoadCursor(IntPtr.Zero, IDC_ARROW),
                hbrBackground = (IntPtr)(COLOR_BTNFACE + 1),
                lpszMenuName = null,
                lpszClassName = className,
                hIconSm = IntPtr.Zero
            };

            ushort atom = RegisterClassEx(ref wndClass);
            if (atom == 0)
            {
                Console.WriteLine("Failed to register window class.");
                return;
            }

            // Create Window with classic style, layered for transparency, custom shape
            IntPtr hWnd = CreateWindowEx(
                WS_EX_CLIENTEDGE | WS_EX_LAYERED,
                className,
                "Classic Windows 95 Style Window",
                WS_OVERLAPPEDWINDOW,
                CW_USEDEFAULT,
                CW_USEDEFAULT,
                500,
                400,
                IntPtr.Zero,
                IntPtr.Zero,
                hInstance,
                IntPtr.Zero);

            if (hWnd == IntPtr.Zero)
            {
                Console.WriteLine("Failed to create window.");
                return;
            }

            SetWindowTheme(hWnd, "", "");

            // Transparency: 240/255 alpha (slightly transparent)
            SetLayeredWindowAttributes(hWnd, 0, 240, LWA_ALPHA);

            // Custom shape: rounded rectangle (system takes ownership of region, do not delete)
            GetWindowRect(hWnd, out RECT wr);
            int w = wr.Right - wr.Left, h = wr.Bottom - wr.Top;
            IntPtr hRgn = CreateRoundRectRgn(0, 0, w, h, 36, 36);
            SetWindowRgn(hWnd, hRgn, true);

            Console.WriteLine("Window created successfully!");

            CreateClassicControls(hWnd, hInstance);

            ShowWindow(hWnd, SW_SHOW);
            UpdateWindow(hWnd);

            MSG msg;
            while (GetMessage(out msg, IntPtr.Zero, 0, 0))
            {
                TranslateMessage(ref msg);
                DispatchMessage(ref msg);
            }
        }

        private static void CreateClassicControls(IntPtr hWnd, IntPtr hInstance)
        {
            IntPtr groupBox = CreateWindowEx(
                0,
                "BUTTON",
                "Classic Controls",
                WS_CHILD | WS_VISIBLE | BS_GROUPBOX,
                20, 80, 440, 120,
                hWnd, IntPtr.Zero, hInstance, IntPtr.Zero);
            SetWindowTheme(groupBox, "", "");

            IntPtr label = CreateWindowEx(
                0,
                "STATIC",
                "Enter your name:",
                WS_CHILD | WS_VISIBLE | SS_LEFT,
                40, 110, 120, 20,
                hWnd, IntPtr.Zero, hInstance, IntPtr.Zero);

            IntPtr textBox = CreateWindowEx(
                WS_EX_CLIENTEDGE,
                "EDIT",
                "",
                WS_CHILD | WS_VISIBLE | ES_LEFT | ES_AUTOHSCROLL,
                160, 108, 280, 24,
                hWnd, IntPtr.Zero, hInstance, IntPtr.Zero);
            SetWindowTheme(textBox, "", "");

            IntPtr button1 = CreateWindowEx(
                0,
                "BUTTON",
                "OK",
                WS_CHILD | WS_VISIBLE | BS_DEFPUSHBUTTON,
                160, 150, 100, 30,
                hWnd, IntPtr.Zero, hInstance, IntPtr.Zero);
            SetWindowTheme(button1, "", "");

            IntPtr button2 = CreateWindowEx(
                0,
                "BUTTON",
                "Cancel",
                WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
                270, 150, 100, 30,
                hWnd, IntPtr.Zero, hInstance, IntPtr.Zero);
            SetWindowTheme(button2, "", "");

            IntPtr oldStyleCheck = CreateWindowEx(
                0,
                "BUTTON",
                "Use old-style Open/Save dialogs (Win 3.1)",
                WS_CHILD | WS_VISIBLE | BS_AUTOCHECKBOX,
                40, 200, 250, 22,
                hWnd, (IntPtr)IDC_USEOLDSTYLE, hInstance, IntPtr.Zero);
            SetWindowTheme(oldStyleCheck, "", "");
            SendMessage(oldStyleCheck, BM_SETCHECK, (IntPtr)BST_CHECKED, IntPtr.Zero); // checked by default

            IntPtr openButton = CreateWindowEx(
                0,
                "BUTTON",
                "Open File...",
                WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
                40, 220, 195, 35,
                hWnd, (IntPtr)IDC_OPENFILE, hInstance, IntPtr.Zero);
            SetWindowTheme(openButton, "", "");

            IntPtr saveButton = CreateWindowEx(
                0,
                "BUTTON",
                "Save File...",
                WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
                245, 220, 195, 35,
                hWnd, (IntPtr)IDC_SAVEFILE, hInstance, IntPtr.Zero);
            SetWindowTheme(saveButton, "", "");

            IntPtr colorButton = CreateWindowEx(
                0,
                "BUTTON",
                "Choose Color",
                WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
                40, 260, 195, 35,
                hWnd, (IntPtr)IDC_CHOOSECOLOR, hInstance, IntPtr.Zero);
            SetWindowTheme(colorButton, "", "");

            IntPtr pickIconButton = CreateWindowEx(
                0,
                "BUTTON",
                "Pick Icon...",
                WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
                245, 260, 195, 35,
                hWnd, (IntPtr)IDC_PICKICON, hInstance, IntPtr.Zero);
            SetWindowTheme(pickIconButton, "", "");

            IntPtr statusLabel = CreateWindowEx(
                WS_EX_STATICEDGE,
                "STATIC",
                "Ready - Classic Windows 95/98 Style UI",
                WS_CHILD | WS_VISIBLE | SS_LEFT,
                0, 320, 500, 24,
                hWnd, IntPtr.Zero, hInstance, IntPtr.Zero);
        }

        private static IntPtr MyWndProc(IntPtr hWnd, uint msg, IntPtr wParam, IntPtr lParam)
        {
            switch (msg)
            {
                case WM_PAINT:
                    PAINTSTRUCT ps;
                    IntPtr hdc = BeginPaint(hWnd, out ps);
                    TextOut(hdc, 20, 20, "Classic Windows 95/98 Style Window", 35);
                    TextOut(hdc, 20, 50, "Using vintage UI controls and beveled borders!", 47);
                    EndPaint(hWnd, ref ps);
                    return IntPtr.Zero;

                case WM_COMMAND:
                    int commandId = (int)(wParam.ToInt32() & 0xFFFF);
                    if (commandId == IDC_OPENFILE)
                        ShowOldStyleFileDialog(hWnd);
                    else if (commandId == IDC_SAVEFILE)
                        ShowOldStyleSaveDialog(hWnd);
                    else if (commandId == IDC_CHOOSECOLOR)
                        ShowOldStyleColorDialog(hWnd);
                    else if (commandId == IDC_PICKICON)
                        ShowPickIconDialog(hWnd);
                    return IntPtr.Zero;

                case WM_CTLCOLORSTATIC:
                case WM_CTLCOLORBTN:
                    return CreateSolidBrush(0x00C0C0C0);

                case WM_DESTROY:
                    PostQuitMessage(0);
                    return IntPtr.Zero;

                default:
                    return DefWindowProc(hWnd, msg, wParam, lParam);
            }
        }

        private static void ShowOldStyleFileDialog(IntPtr hWnd)
        {
            string file = new string('\0', MAX_PATH);
            
            OPENFILENAME ofn = new OPENFILENAME
            {
                lStructSize = Marshal.SizeOf(typeof(OPENFILENAME)),
                hwndOwner = hWnd,
                lpstrFilter = "All Files (*.*)\0*.*\0Text Files (*.txt)\0*.txt\0",
                lpstrFile = file,
                nMaxFile = MAX_PATH,
                lpstrFileTitle = null,
                nMaxFileTitle = 0,
                lpstrInitialDir = null,
                lpstrTitle = "Open File - Windows 3.1 Style",
                Flags = OFN_PATHMUSTEXIST | OFN_FILEMUSTEXIST | OFN_NOCHANGEDIR,
                lpstrDefExt = null
            };
            if (UseOldStyleDialogs(hWnd))
                ApplyOldStyleToOpenFileName(ref ofn);

            if (GetOpenFileName(ref ofn))
            {
                int end = ofn.lpstrFile.IndexOf('\0');
                string selectedFile = end >= 0 ? ofn.lpstrFile.Substring(0, end) : ofn.lpstrFile.TrimEnd('\0');
                MessageBox(hWnd, "You selected:\n" + selectedFile, "File Selected", 0);
            }
        }

        private static void ShowOldStyleSaveDialog(IntPtr hWnd)
        {
            string file = new string('\0', MAX_PATH);

            OPENFILENAME ofn = new OPENFILENAME
            {
                lStructSize = Marshal.SizeOf(typeof(OPENFILENAME)),
                hwndOwner = hWnd,
                lpstrFilter = "All Files (*.*)\0*.*\0Text Files (*.txt)\0*.txt\0",
                lpstrFile = file,
                nMaxFile = MAX_PATH,
                lpstrFileTitle = null,
                nMaxFileTitle = 0,
                lpstrInitialDir = null,
                lpstrTitle = "Save File - Windows 3.1 Style",
                Flags = OFN_PATHMUSTEXIST | OFN_NOCHANGEDIR,
                lpstrDefExt = "txt"
            };
            if (UseOldStyleDialogs(hWnd))
                ApplyOldStyleToOpenFileName(ref ofn);

            if (GetSaveFileName(ref ofn))
            {
                int end = ofn.lpstrFile.IndexOf('\0');
                string selectedFile = end >= 0 ? ofn.lpstrFile.Substring(0, end) : ofn.lpstrFile.TrimEnd('\0');
                MessageBox(hWnd, "You chose to save as:\n" + selectedFile, "Save File", 0);
            }
        }

        private static void ShowOldStyleColorDialog(IntPtr hWnd)
        {
            int[] custColors = new int[16];
            for (int i = 0; i < 16; i++)
                custColors[i] = 0x00FFFFFF;
            GCHandle custColorsHandle = GCHandle.Alloc(custColors, GCHandleType.Pinned);
            try
            {
                CHOOSECOLOR cc = new CHOOSECOLOR
                {
                    lStructSize = Marshal.SizeOf(typeof(CHOOSECOLOR)),
                    hwndOwner = hWnd,
                    rgbResult = 0x00000000,
                    lpCustColors = custColorsHandle.AddrOfPinnedObject(),
                    Flags = CC_RGBINIT,
                    lpfnHook = IntPtr.Zero,
                    lpTemplateName = IntPtr.Zero
                };
                // Note: ChooseColor has no old/new style switch (unlike Open/Save); hook not used for appearance.
                if (ChooseColor(ref cc))
                {
                    uint c = cc.rgbResult;
                    int r = (int)(c & 0xFF), g = (int)((c >> 8) & 0xFF), b = (int)((c >> 16) & 0xFF);
                    MessageBox(hWnd, string.Format("Color: R={0} G={1} B={2}\n(0x{3:X6})", r, g, b, c & 0xFFFFFF), "Color Selected", 0);
                }
            }
            finally
            {
                custColorsHandle.Free();
            }
        }

        private static void ShowPickIconDialog(IntPtr hWnd)
        {
            StringBuilder path = new StringBuilder(MAX_PATH);
            int iconIndex = 0;
            if (PickIconDlg(hWnd, path, (uint)path.Capacity, ref iconIndex) != 0)
            {
                string iconPath = path.ToString().TrimEnd('\0');
                int end = iconPath.IndexOf('\0');
                if (end >= 0) iconPath = iconPath.Substring(0, end);
                MessageBox(hWnd, "Icon file: " + iconPath + "\nIcon index: " + iconIndex, "Pick Icon", 0);
            }
        }
    }
}
