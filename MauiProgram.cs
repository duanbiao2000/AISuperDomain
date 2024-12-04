// 导入Microsoft.Extensions.Logging命名空间
using Microsoft.Extensions.Logging;

namespace AIIntegrator;

public static class MauiProgram
{
	// 创建Maui应用程序
	public static MauiApp CreateMauiApp()
	{
		// 创建Maui应用程序构建器
		var builder = MauiApp.CreateBuilder();
		// 使用App类作为Maui应用程序
		builder
			.UseMauiApp<App>()
			// 配置字体
			.ConfigureFonts(fonts =>
			{
				// 添加OpenSans-Regular.ttf字体，名称为OpenSansRegular
				fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
				// 添加OpenSans-Semibold.ttf字体，名称为OpenSansSemibold
				fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
			});

#if DEBUG
        // 在调试模式下添加调试日志
        builder.Logging.AddDebug();
#endif

		// 构建并返回Maui应用程序
		return builder.Build();
	}
}
