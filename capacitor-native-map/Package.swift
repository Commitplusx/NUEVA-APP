// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CapacitorNativeMap",
    platforms: [.iOS(.v14)],
    products: [
        .library(
            name: "CapacitorNativeMap",
            targets: ["NativeMapPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "7.0.0")
    ],
    targets: [
        .target(
            name: "NativeMapPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Sources/NativeMapPlugin"),
        .testTarget(
            name: "NativeMapPluginTests",
            dependencies: ["NativeMapPlugin"],
            path: "ios/Tests/NativeMapPluginTests")
    ]
)