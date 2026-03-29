import {
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown,
  ChevronRight, ChevronDown, ChevronUp, ChevronLeft, ChevronsUpDown,
  Move, CornerDownRight,
  Search, Settings, Home, Menu, Plus, X as XIcon, Filter, Layers,
  SlidersHorizontal, Eye, EyeOff, Maximize, Minimize,
  Check, CheckCircle2 as CheckCircle, AlertCircle, Info, AlertTriangle, Ban,
  CircleCheck, CircleX, ShieldCheck,
  Heart, ThumbsUp, Share2, Bookmark, User, Users,
  MessageCircle, MessageSquare, AtSign,
  Play, Pause, SkipForward, SkipBack, Volume2, Camera, Music, Mic,
  Image, Video, Film,
  Star, Zap, Clock, Calendar, Globe, Lock, Unlock,
  Shield, Flag, Gift, Trophy, Crown, Flame, Sparkles, Target,
  Mail, Phone, Send, Bell, Inbox,
  Sun, Moon, Cloud, CloudRain, Droplets, Thermometer, Wind,
  Monitor, Smartphone, Tablet, Wifi, Bluetooth, Battery,
  Download, Upload, ExternalLink, Link, Paperclip, Clipboard,
  Code, Terminal, Database, HardDrive, Cpu, Server,
  FileText, FolderOpen, File, Trash2,
  MapPin, Navigation, Compass,
  ShoppingCart, CreditCard, DollarSign, Wallet, Receipt,
  PenTool, Palette, Brush, Eraser, Scissors,
  LayoutGrid, LayoutList, Table, Columns3, Rows3,
  LogIn, LogOut, Key, Fingerprint, QrCode,
  Lightbulb, BookOpen, GraduationCap, Brain, Puzzle,
  HeartPulse, Activity, Dumbbell, Apple, Coffee,
} from "lucide-static";

export interface IconEntry {
  name: string;
  category: string;
  svg: string;
}

const C = (name: string, category: string, svg: string): IconEntry => ({ name, category, svg });

export const ICON_LIBRARY: IconEntry[] = [
  // ── Arrows ──────────────────────────────────────────────────────
  C("Arrow Right", "Arrows", ArrowRight),
  C("Arrow Left", "Arrows", ArrowLeft),
  C("Arrow Up", "Arrows", ArrowUp),
  C("Arrow Down", "Arrows", ArrowDown),
  C("Chevron Right", "Arrows", ChevronRight),
  C("Chevron Down", "Arrows", ChevronDown),
  C("Chevron Up", "Arrows", ChevronUp),
  C("Chevron Left", "Arrows", ChevronLeft),
  C("Chevrons Up Down", "Arrows", ChevronsUpDown),
  C("Move", "Arrows", Move),
  C("Corner Down Right", "Arrows", CornerDownRight),

  // ── UI ──────────────────────────────────────────────────────────
  C("Search", "UI", Search),
  C("Settings", "UI", Settings),
  C("Home", "UI", Home),
  C("Menu", "UI", Menu),
  C("Plus", "UI", Plus),
  C("X", "UI", XIcon),
  C("Filter", "UI", Filter),
  C("Layers", "UI", Layers),
  C("Sliders", "UI", SlidersHorizontal),
  C("Eye", "UI", Eye),
  C("Eye Off", "UI", EyeOff),
  C("Maximize", "UI", Maximize),
  C("Minimize", "UI", Minimize),

  // ── Status ──────────────────────────────────────────────────────
  C("Check", "Status", Check),
  C("Check Circle", "Status", CheckCircle),
  C("Alert Circle", "Status", AlertCircle),
  C("Info", "Status", Info),
  C("Alert Triangle", "Status", AlertTriangle),
  C("Ban", "Status", Ban),
  C("Circle Check", "Status", CircleCheck),
  C("Circle X", "Status", CircleX),
  C("Shield Check", "Status", ShieldCheck),

  // ── Social ──────────────────────────────────────────────────────
  C("Heart", "Social", Heart),
  C("Thumbs Up", "Social", ThumbsUp),
  C("Share", "Social", Share2),
  C("Bookmark", "Social", Bookmark),
  C("User", "Social", User),
  C("Users", "Social", Users),
  C("Message Circle", "Social", MessageCircle),
  C("Message Square", "Social", MessageSquare),
  C("At Sign", "Social", AtSign),

  // ── Media ───────────────────────────────────────────────────────
  C("Play", "Media", Play),
  C("Pause", "Media", Pause),
  C("Skip Forward", "Media", SkipForward),
  C("Skip Back", "Media", SkipBack),
  C("Volume", "Media", Volume2),
  C("Camera", "Media", Camera),
  C("Music", "Media", Music),
  C("Mic", "Media", Mic),
  C("Image", "Media", Image),
  C("Video", "Media", Video),
  C("Film", "Media", Film),

  // ── Objects ─────────────────────────────────────────────────────
  C("Star", "Objects", Star),
  C("Zap", "Objects", Zap),
  C("Clock", "Objects", Clock),
  C("Calendar", "Objects", Calendar),
  C("Globe", "Objects", Globe),
  C("Lock", "Objects", Lock),
  C("Unlock", "Objects", Unlock),
  C("Shield", "Objects", Shield),
  C("Flag", "Objects", Flag),
  C("Gift", "Objects", Gift),
  C("Trophy", "Objects", Trophy),
  C("Crown", "Objects", Crown),
  C("Flame", "Objects", Flame),
  C("Sparkles", "Objects", Sparkles),
  C("Target", "Objects", Target),

  // ── Communication ───────────────────────────────────────────────
  C("Mail", "Communication", Mail),
  C("Phone", "Communication", Phone),
  C("Send", "Communication", Send),
  C("Bell", "Communication", Bell),
  C("Inbox", "Communication", Inbox),

  // ── Weather ─────────────────────────────────────────────────────
  C("Sun", "Weather", Sun),
  C("Moon", "Weather", Moon),
  C("Cloud", "Weather", Cloud),
  C("Cloud Rain", "Weather", CloudRain),
  C("Droplets", "Weather", Droplets),
  C("Thermometer", "Weather", Thermometer),
  C("Wind", "Weather", Wind),

  // ── Tech ────────────────────────────────────────────────────────
  C("Monitor", "Tech", Monitor),
  C("Smartphone", "Tech", Smartphone),
  C("Tablet", "Tech", Tablet),
  C("Wifi", "Tech", Wifi),
  C("Bluetooth", "Tech", Bluetooth),
  C("Battery", "Tech", Battery),
  C("Download", "Tech", Download),
  C("Upload", "Tech", Upload),
  C("External Link", "Tech", ExternalLink),
  C("Link", "Tech", Link),
  C("Paperclip", "Tech", Paperclip),
  C("Clipboard", "Tech", Clipboard),
  C("Code", "Tech", Code),
  C("Terminal", "Tech", Terminal),
  C("Database", "Tech", Database),
  C("Hard Drive", "Tech", HardDrive),
  C("CPU", "Tech", Cpu),
  C("Server", "Tech", Server),

  // ── Files ───────────────────────────────────────────────────────
  C("File Text", "Files", FileText),
  C("Folder Open", "Files", FolderOpen),
  C("File", "Files", File),
  C("Trash", "Files", Trash2),

  // ── Location ────────────────────────────────────────────────────
  C("Map Pin", "Location", MapPin),
  C("Navigation", "Location", Navigation),
  C("Compass", "Location", Compass),

  // ── Commerce ────────────────────────────────────────────────────
  C("Shopping Cart", "Commerce", ShoppingCart),
  C("Credit Card", "Commerce", CreditCard),
  C("Dollar Sign", "Commerce", DollarSign),
  C("Wallet", "Commerce", Wallet),
  C("Receipt", "Commerce", Receipt),

  // ── Creative ────────────────────────────────────────────────────
  C("Pen Tool", "Creative", PenTool),
  C("Palette", "Creative", Palette),
  C("Brush", "Creative", Brush),
  C("Eraser", "Creative", Eraser),
  C("Scissors", "Creative", Scissors),

  // ── Layout ──────────────────────────────────────────────────────
  C("Grid", "Layout", LayoutGrid),
  C("List", "Layout", LayoutList),
  C("Table", "Layout", Table),
  C("Columns", "Layout", Columns3),
  C("Rows", "Layout", Rows3),

  // ── Auth ────────────────────────────────────────────────────────
  C("Log In", "Auth", LogIn),
  C("Log Out", "Auth", LogOut),
  C("Key", "Auth", Key),
  C("Fingerprint", "Auth", Fingerprint),
  C("QR Code", "Auth", QrCode),

  // ── Education ───────────────────────────────────────────────────
  C("Lightbulb", "Education", Lightbulb),
  C("Book Open", "Education", BookOpen),
  C("Graduation Cap", "Education", GraduationCap),
  C("Brain", "Education", Brain),
  C("Puzzle", "Education", Puzzle),

  // ── Health ──────────────────────────────────────────────────────
  C("Heart Pulse", "Health", HeartPulse),
  C("Activity", "Health", Activity),
  C("Dumbbell", "Health", Dumbbell),
  C("Apple", "Health", Apple),
  C("Coffee", "Health", Coffee),
];

export const ICON_CATEGORIES = [...new Set(ICON_LIBRARY.map((i) => i.category))];
