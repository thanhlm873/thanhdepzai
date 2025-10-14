

const PROMPT_TEMPLATES: Record<string, string> = {
  FACE_SWAP_POSTER: `Ghép mặt vào nhân vật trên áp phích phim, giữ lại nhận dạng và cấu trúc khuôn mặt từ ảnh gốc, khớp với tư thế đầu và ánh sáng, hòa trộn tông màu da một cách tự nhiên; chỉnh màu theo phong cách điện ảnh; Giao diện chân dung 85mm; độ trung thực cao, các cạnh sắc nét; đầu ra theo tỷ lệ 4:5 dọc; ràng buộc: bảo toàn tỷ lệ cơ thể, tránh làm biến dạng; tiêu cực: không có lỗi ảnh, không thừa răng, không mờ, mặt không bị méo.`,
  OUTFIT_TRYON_AODAI: `Thử trang phục AI: thay thế trang phục hiện tại bằng một chiếc Áo dài truyền thống Việt Nam màu trắng, duy trì hình dáng và tư thế cơ thể, nếp gấp vải và kết cấu vải chân thực; ánh sáng tự nhiên dịu nhẹ; Máy ảnh: 50mm; ảnh thực, tông màu da được bảo toàn; đầu ra 3:4 dọc; ràng buộc: giữ nhận dạng khuôn mặt; tiêu cực: không có nút bị lệch, không có hoa văn nổi, không bóng như nhựa.`,
  REPLACE_BG_ADD_PROP: `Thay thế hậu cảnh thành một con phố đêm mưa ở Tokyo với các biển hiệu neon, thêm đạo cụ: đang cầm một chiếc ô trong suốt, khớp với phối cảnh và bóng đổ; mặt đất ẩm ướt phản chiếu, ánh sáng viền trên tóc; Ống kính: 35mm; màu phim với tông xanh-cam; chi tiết cao; đầu ra 9:16 dọc; ràng buộc: giữ nhận dạng khuôn mặt, bảo toàn giải phẫu bàn tay; tiêu cực: không có hai tay, không có đạo cụ lơ lửng, không có bóng đổ không khớp.`,
  RESTORE_COLORIZE: `Phục chế và tô màu ảnh: loại bỏ các vết trầy xước, bụi và nhược điểm, tái tạo các chi tiết bị mất trên khuôn mặt và quần áo, áp dụng màu sắc tự nhiên và chân thực với tông màu da chính xác; thêm một chút nhiễu hạt phim để tạo cảm giác cổ điển, sử dụng bảng màu phù hợp với những năm 1960; ràng buộc: giữ các đặc điểm trên khuôn mặt đúng với chủ thể; tiêu cực: không làm mịn quá mức, không có quầng sáng, không có da như nhựa.`,
  STYLE_TRANSFER_ANIME: `Tạo kiểu cho bức ảnh thành một cảnh anime của studio Ghibli. Sử dụng kết cấu màu nước, bảng màu pastel nhẹ nhàng và đường nét sạch sẽ. Cho chủ thể đôi mắt to biểu cảm trong khi vẫn giữ lại các dấu hiệu nhận dạng chính như kiểu tóc. Hậu cảnh phải là một cánh đồng xanh tươi tốt với ánh nắng dịu nhẹ xuyên qua tán cây; đầu ra 1:1 hình vuông; ràng buộc: giữ nguyên hình dạng và màu tóc gốc; tiêu cực: không có thêm chi, không có lớp phủ văn bản, không có đường viền lộn xộn.`,
  REMOVE_OBJECT: `Loại bỏ vật thể hoặc người không mong muốn nổi bật nhất ở hậu cảnh, tô lại hậu cảnh bằng kết cấu và phối cảnh nhất quán, phù hợp hoàn hảo với môi trường xung quanh; duy trì sự liên tục của ánh sáng hiện có; đảm bảo các cạnh sắc nét xung quanh chủ thể chính; ràng buộc: bảo toàn bóng và phản chiếu gần đó; tiêu cực: không có vết bẩn, không có hoa văn lặp lại, không có lỗi ảnh.`,
  UPSCALE_4X: `Nâng cấp hình ảnh lên 4 lần. Nâng cao chi tiết, làm sắc nét các cạnh và giảm nhiễu trong khi vẫn duy trì vẻ tự nhiên. Tái tạo các đặc điểm và kết cấu khuôn mặt với độ trung thực cao. Kết quả phải là một hình ảnh có độ phân giải cao, chân thực. tiêu cực: không có da như nhựa, không làm sắc nét quá mức, không có lỗi ảnh.`,
  BEAUTIFY_PORTRAIT: `Làm đẹp chân dung một cách tinh tế. Làm mịn kết cấu da một cách tự nhiên, giảm các khuyết điểm và mụn, làm sáng mắt và làm trắng răng một chút. Duy trì tông màu da và cấu trúc khuôn mặt ban đầu. Mục tiêu là nâng cao một cách tự nhiên, không phải là một vẻ ngoài nhân tạo. tiêu cực: không có da như nhựa, không có chi tiết mờ, không có mắt quá sáng.`,
  REPLACE_BG: `Thay thế hậu cảnh bằng một bãi biển thanh bình lúc hoàng hôn. Đảm bảo ánh sáng trên chủ thể khớp với ánh sáng giờ vàng của hậu cảnh mới, với bóng đổ mềm mại. Sự chuyển tiếp giữa chủ thể và hậu cảnh mới phải liền mạch. tiêu cực: không có cạnh cứng, không có ánh sáng không khớp.`,
  CHANGE_SCENE_DAY_NIGHT: `Chuyển cảnh từ ngày sang đêm. Thêm một bầu trời đầy sao, một mặt trăng tròn sáng và các nguồn sáng nhân tạo như đèn đường. Tạo bóng và phản chiếu thực tế dựa trên ánh sáng mới. Tâm trạng nên yên tĩnh và thanh bình. tiêu cực: không có ánh sáng phi thực tế, không có nhiễu.`,
  ADD_OBJECT_PET: `Thêm một chú chó con golden retriever nhỏ, lông xù đang ngồi dưới chân chủ thể. Chú chó con nên nhìn lên chủ thể. Đảm bảo ánh sáng, bóng đổ và phối cảnh của chú chó con khớp hoàn hảo với cảnh. tiêu cực: không có thú cưng lơ lửng, không có bóng đổ không khớp.`,
  TREND_AI_AVATAR: `Tạo một avatar/ảnh kỷ yếu AI chuyên nghiệp. Chủ thể nên ở trong một phông nền studio cổ điển. Ánh sáng nên là thiết lập 3 điểm trong studio. Hình ảnh cuối cùng phải trông giống như một bức chân dung studio chất lượng cao. độ trung thực cao, kết cấu da tự nhiên. tiêu cực: không có lỗi ảnh, không có da như nhựa.`,
  TREND_CINEMATIC_STILLS: `Tạo cho bức ảnh một giao diện điện ảnh. Áp dụng cấp màu xanh mòng két và cam, thêm tỷ lệ khung hình 2.35:1 (hộp thư) và một chút nhiễu hạt phim tinh tế. Ánh sáng phải tạo cảm giác kịch tính và có chủ ý, giống như một cảnh tĩnh từ một bộ phim. DOF nông, bokeh anamorphic. tiêu cực: không có dải màu, không bão hòa quá mức.`,
  TREND_3D_PARALLAX: `Tạo hiệu ứng thị sai 2.5D. Nhẹ nhàng làm cho chủ thể tiền cảnh di chuyển riêng biệt với hậu cảnh, tạo cảm giác chiều sâu. Chuyển động phải chậm và mượt mà.`,
  TREND_FACE_SWAP_MV: `Dựa trên hai hình ảnh đã cho, hãy thực hiện hoán đổi khuôn mặt. Lấy khuôn mặt từ hình ảnh thứ hai và ghép nó vào người trong hình ảnh thứ nhất. Giữ nguyên tóc, cơ thể, quần áo và hậu cảnh từ hình ảnh thứ nhất. Kết quả phải là một sự hòa trộn liền mạch, chân thực, khớp với tông màu da, ánh sáng và góc đầu của hình ảnh thứ nhất.`,
  TREND_NEON_GLITCH: `Áp dụng hiệu ứng neon và glitch tương lai. Thêm các đường neon phát sáng theo hình bóng của chủ thể và hiệu ứng nhiễu/tĩnh kỹ thuật số tinh tế cho hậu cảnh. Bảng màu phải được lấy cảm hứng từ cyberpunk (hồng, xanh dương, tím).`,
  SHARPEN_IMAGE: `Làm sắc nét và khử mờ hình ảnh một cách đáng kể. Nâng cao và tái tạo các chi tiết nhỏ, đặc biệt là trên khuôn mặt, tóc và kết cấu, để phục hồi thông tin bị mất do mờ hoặc chất lượng hình ảnh thấp. Kết quả cuối cùng phải là một bức ảnh sắc nét, rõ ràng và có độ chi tiết cao, như thể được chụp bằng ống kính máy ảnh cao cấp. tiêu cực: không có lỗi kỹ thuật số, không có quầng sáng do làm sắc nét quá mức, không có da trông như nhựa.`,
  IMAGE_COLLAGE: `Tạo một ảnh ghép nghệ thuật từ TẤT CẢ các hình ảnh đã được cung cấp. Sắp xếp chúng thành một bố cục gắn kết, sáng tạo. Mặc định, hãy tạo một bố cục lưới đơn giản, sạch sẽ với các đường viền trắng mỏng trừ khi có yêu cầu khác được thêm vào mô tả này.`,
  EDIT_NANO_BANANA: `Bạn là Nano Banana, một trợ lý AI sáng tạo. Hãy chỉnh sửa hình ảnh này dựa trên yêu cầu của người dùng. Hướng tới kết quả chất lượng cao, sáng tạo và đáng ngạc nhiên.`,
  
  // Prompts for Filters
  FILTER_BW_NOIR: "Áp dụng bộ lọc đen trắng theo phong cách film noir. Tăng cường độ tương phản, tạo bóng sâu và vùng sáng mạnh mẽ để tạo ra một tâm trạng kịch tính, bí ẩn. Giữ lại chi tiết trong cả vùng tối và vùng sáng.",
  FILTER_BW_HIGH_CONTRAST: "Chuyển ảnh sang đen trắng với độ tương phản cực cao. Làm cho màu đen trở nên sâu thẳm và màu trắng trở nên rực rỡ, loại bỏ hầu hết các tông màu xám trung gian để có một cái nhìn đồ họa, mạnh mẽ.",
  FILTER_VINTAGE_SEPIA: "Áp dụng tông màu sepia cổ điển cho bức ảnh, tạo ra một sắc thái màu nâu ấm áp. Giảm nhẹ độ tương phản và thêm một chút nhiễu hạt (grain) để mô phỏng vẻ ngoài của những bức ảnh cũ.",
  FILTER_VINTAGE_FADED: "Tạo hiệu ứng ảnh cổ điển với màu sắc bị phai. Giảm độ bão hòa, nâng vùng tối (lifted blacks) để tạo ra một lớp màng mờ nhẹ, và chuyển tông màu xanh lam sang màu xanh mòng két (teal). Mang lại cảm giác hoài cổ.",
  FILTER_FILM_KODAK: "Mô phỏng giao diện của phim Kodak cổ điển. Tăng cường độ bão hòa cho các màu cơ bản (đỏ, xanh dương, vàng), tạo ra màu sắc sống động, ấm áp và một chút tương phản để có cái nhìn chân thực, cổ điển.",
  FILTER_FILM_FUJI: "Mô phỏng giao diện của phim Fuji cổ điển. Đặc trưng bởi tông màu xanh lá cây và xanh lam tinh tế, tông màu da tự nhiên và độ tương phản nhẹ nhàng. Tạo ra một cái nhìn dịu mắt, hơi lạnh và sạch sẽ.",
  FILTER_CINEMATIC_TEAL_ORANGE: "Áp dụng hiệu ứng màu điện ảnh 'Teal and Orange'. Chuyển tông màu lạnh (bóng, bầu trời) sang màu xanh mòng két (teal) và tông màu ấm (da người, ánh sáng) sang màu cam. Tăng cường độ tương phản để tạo ra một cái nhìn kịch tính, chuyên nghiệp.",
  FILTER_CINEMATIC_MOODY: "Tạo một tâm trạng điện ảnh u buồn, sâu lắng. Giảm độ bão hòa tổng thể, tăng cường bóng tối và áp dụng một tông màu lạnh (xanh dương hoặc xanh lá cây) cho các vùng tối. Giữ lại các điểm nhấn ấm áp một cách có chọn lọc để tạo chiều sâu.",
  FILTER_NATURAL_VIBRANT: "Tăng cường màu sắc tự nhiên của bức ảnh một cách tinh tế. Làm cho màu sắc trở nên rực rỡ và sống động hơn mà không bị quá bão hòa hoặc trông giả tạo. Cải thiện độ trong và tương phản nhẹ để làm nổi bật các chi tiết.",
  FILTER_NATURAL_SOFT: "Áp dụng một hiệu ứng tự nhiên, dịu nhẹ. Giảm nhẹ độ tương phản, làm mềm các vùng sáng và thêm một chút tông màu ấm áp. Tạo ra một cảm giác nhẹ nhàng, thơ mộng và dễ chịu cho mắt.",
  FILTER_NOSTALGIC_80S: "Tái tạo phong cách ảnh của những năm 1980. Đặc trưng bởi màu sắc hơi bão hòa, một chút tông màu đỏ tươi (magenta) trong vùng tối, và nhiễu hạt phim nhẹ. Tạo cảm giác hoài cổ về kỷ nguyên phim analog.",
  FILTER_NOSTALGIC_90S: "Tái tạo phong cách ảnh của những năm 1990. Màu sắc có xu hướng chân thực hơn nhưng với độ tương phản nhẹ và tông màu hơi ấm. Gợi nhớ về những bức ảnh từ máy ảnh phim 'point-and-shoot' phổ biến thời đó.",
  FILTER_FOOD_FRESH: "Tối ưu hóa ảnh chụp món ăn để trông tươi ngon. Tăng cường độ sáng, độ bão hòa và độ sắc nét một cách có chọn lọc. Làm cho màu xanh lá cây và màu đỏ trở nên nổi bật hơn để nhấn mạnh sự tươi mới của nguyên liệu.",
  FILTER_FOOD_WARM: "Tối ưu hóa ảnh chụp món ăn để tạo cảm giác ấm cúng, hấp dẫn. Thêm tông màu ấm, tăng cường độ tương phản để tạo chiều sâu và làm cho món ăn trông ngon miệng hơn.",
  
  DEFAULT: `Nâng cao bức ảnh này với việc chỉnh màu chuyên nghiệp, cải thiện ánh sáng và độ tương phản, và làm sắc nét các chi tiết để có kết quả sắc nét, chất lượng cao.`
};


export const generatePrompt = (taskId: string | null): string => {
  return PROMPT_TEMPLATES[taskId || 'DEFAULT'] || PROMPT_TEMPLATES['DEFAULT'];
};
// The maximum dimension for image processing. Set to 4096 to support 4K resolution.
const MAX_DIMENSION = 4096;

/**
 * Resizes an image file if its dimensions exceed MAX_DIMENSION.
 * @param file The image file to resize.
 * @returns A promise that resolves with a data URL of the resized image.
 */
export const resizeImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      if (!event.target?.result) {
        return reject(new Error("Failed to read file."));
      }

      const img = new Image();
      img.src = event.target.result as string;
      img.onload = () => {
        const { width, height } = img;

        // If image is small enough, no need to resize
        if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
          resolve(img.src);
          return;
        }

        let newWidth, newHeight;
        if (width > height) {
          newWidth = MAX_DIMENSION;
          newHeight = (height * MAX_DIMENSION) / width;
        } else {
          newHeight = MAX_DIMENSION;
          newWidth = (width * MAX_DIMENSION) / height;
        }

        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }

        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        // Preserve PNG for lossless quality, otherwise use high-quality JPEG.
        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        // For JPEG, use quality 1.0 (highest). This parameter is ignored for PNG.
        const resizedDataUrl = canvas.toDataURL(mimeType, 1.0);
        resolve(resizedDataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};
