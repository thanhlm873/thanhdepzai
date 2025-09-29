import type { EditingCategory } from './types';
import { 
  Wand2, Zap, Palette, ImageUp, Smile, Scissors, Sparkles, Film, BotMessageSquare, Sun, Truck, Clapperboard, Camera, Users, BrainCircuit, Filter, LayoutGrid, Contrast, History, Utensils
} from 'lucide-react';

export const EDITING_CATEGORIES: EditingCategory[] = [
  {
    name: "Sáng tạo với AI (Creative/GenAI)",
    tasks: [
      { id: "STYLE_TRANSFER_ANIME", name: "Anime/Ghibli hoá", icon: Palette },
      { id: "IMAGE_COLLAGE", name: "Ghép ảnh vào khung", icon: LayoutGrid },
      { id: "FACE_SWAP_POSTER", name: "Ghép mặt vào poster phim", icon: Film },
      { id: "OUTFIT_TRYON_AODAI", name: "Thử trang phục (Áo dài)", icon: Sparkles },
      { id: "REPLACE_BG_ADD_PROP", name: "Đổi nền & ghép đạo cụ", icon: Wand2 },
      { id: "CHANGE_SCENE_DAY_NIGHT", name: "Đổi cảnh (Ngày/Đêm)", icon: Sun },
      { id: "ADD_OBJECT_PET", name: "Thêm vật thể (Thú cưng)", icon: BotMessageSquare },
      { id: "EDIT_NANO_BANANA", name: "Tạo/sửa ảnh với Nano Banana", icon: BrainCircuit },
    ]
  },
  {
    name: "Chỉnh sửa & Biến đổi ảnh (AI Edit)",
    tasks: [
      { id: "REMOVE_OBJECT", name: "Xoá vật thể", icon: Scissors },
      { id: "REPLACE_BG", name: "Đổi nền", icon: Wand2 },
      { id: "UPSCALE_4X", name: "Super-Resolution x4", icon: ImageUp },
      { id: "BEAUTIFY_PORTRAIT", name: "Làm đẹp/Chân dung", icon: Smile },
      { id: "RESTORE_COLORIZE", name: "Phục chế & tô màu ảnh cũ", icon: Zap },
      { id: "SHARPEN_IMAGE", name: "Tăng độ nét", icon: Filter },
    ]
  },
  {
    name: "Bộ lọc ảnh (Filters)",
    tasks: [
      { id: "FILTER_BW_NOIR", name: "Noir (Đen/Trắng)", icon: Contrast },
      { id: "FILTER_BW_HIGH_CONTRAST", name: "Tương phản cao", icon: Contrast },
      { id: "FILTER_VINTAGE_SEPIA", name: "Cổ điển (Sepia)", icon: Camera },
      { id: "FILTER_VINTAGE_FADED", name: "Cổ điển (Phai màu)", icon: Camera },
      { id: "FILTER_FILM_KODAK", name: "Phim Kodak", icon: Film },
      { id: "FILTER_FILM_FUJI", name: "Phim Fuji", icon: Film },
      { id: "FILTER_CINEMATIC_TEAL_ORANGE", name: "Điện ảnh (Teal & Orange)", icon: Clapperboard },
      { id: "FILTER_CINEMATIC_MOODY", name: "Điện ảnh (Tâm trạng)", icon: Clapperboard },
      { id: "FILTER_NATURAL_VIBRANT", name: "Tự nhiên (Rực rỡ)", icon: Sun },
      { id: "FILTER_NATURAL_SOFT", name: "Tự nhiên (Dịu nhẹ)", icon: Sun },
      { id: "FILTER_NOSTALGIC_80S", name: "Hoài cổ (80s)", icon: History },
      { id: "FILTER_NOSTALGIC_90S", name: "Hoài cổ (90s)", icon: History },
      { id: "FILTER_FOOD_FRESH", name: "Món ăn (Tươi)", icon: Utensils },
      { id: "FILTER_FOOD_WARM", name: "Món ăn (Ấm)", icon: Utensils },
    ]
  },
  {
    name: "Trend Hub",
    tasks: [
      { id: "TREND_AI_AVATAR", name: "AI Avatar/Yearbook", icon: Users },
      { id: "TREND_CINEMATIC_STILLS", name: "Cinematic Stills", icon: Clapperboard },
      { id: "TREND_3D_PARALLAX", name: "3D Parallax Effect", icon: Camera },
      { id: "TREND_FACE_SWAP_MV", name: "Face Swap", icon: Film },
      { id: "TREND_NEON_GLITCH", name: "Neon/Glitch Effect", icon: BrainCircuit },
    ]
  }
];