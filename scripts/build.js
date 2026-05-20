import { rmSync, mkdirSync, cpSync, writeFileSync } from 'fs'
import chalk from 'chalk'
import { build } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import dts from 'vite-plugin-dts'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function buildLib() {
  try {
    // 清理目录
    console.log(chalk.blue('🧹 清理构建目录...'))
    rmSync('dist', { recursive: true, force: true })
    mkdirSync('dist')

    // 构建库
    console.log(chalk.blue('\n📦 开始构建库...'))
    await build({
      // 不使用 vite.config.ts 配置文件, 防止冲突
      configFile: false,
      plugins: [
        vue(),
        UnoCSS(),
        dts({
          tsconfigPath: './tsconfig.lib.json',
          outDir: 'dist/types',
          insertTypesEntry: true,
          copyDtsFiles: true,
        }),
      ],
      resolve: {
        alias: {
          '@': resolve(__dirname, '../src')
        }
      },
      build: {
        lib: {
          entry: resolve(__dirname, '../src/libs/index.ts'),
          name: 'VueKeepAliveIframe',
          fileName: (format) => `vue-keep-alive-iframe.${format}.js`,
        },
        copyPublicDir: false,
        sourcemap: true,
        rollupOptions: {
          external: ['vue'],
          output: {
            globals: {
              vue: 'Vue',
            },
            exports: 'named',
          },
        },
      },
    })

    // 读取原始 package.json
    console.log(chalk.blue('\n📦 生成 package.json...'))
    const { readFileSync } = await import('fs')
    const originalPkg = JSON.parse(readFileSync('package.json', 'utf-8'))

    // 生成构建后的 package.json
    const distPkgContent = {
      name: originalPkg.name,
      version: originalPkg.version,
      description: originalPkg.description,
      main: './vue-keep-alive-iframe.umd.js',
      module: './vue-keep-alive-iframe.es.js',
      types: './types/index.d.ts',
      style: './vue-keep-alive-iframe.css',
      files: [
        '*.js',
        '*.js.map',
        '*.css',
        'types/',
        'README.md'
      ],
      exports: {
        '.': {
          import: './vue-keep-alive-iframe.es.js',
          require: './vue-keep-alive-iframe.umd.js',
          types: './types/index.d.ts'
        },
        './style.css': './vue-keep-alive-iframe.css'
      },
      keywords: originalPkg.keywords || ['vue', 'iframe', 'keep-alive'],
      author: originalPkg.author,
      license: originalPkg.license,
      homepage: originalPkg.homepage,
      repository: originalPkg.repository,
      bugs: originalPkg.bugs,
      peerDependencies: {
        vue: '>=2.7.0 || >=3.0.0'
      }
    }

    writeFileSync('dist/package.json', JSON.stringify(distPkgContent, null, 2))

    // 复制 README
    console.log(chalk.blue('\n📄 复制 README...'))
    cpSync('README.md', 'dist/README.md')

    // 构建完成
    console.log(chalk.green('\n✨ 构建完成！'))
    console.log(chalk.gray('输出目录: ') + chalk.yellow('dist/'))

    // 显示生成的文件
    console.log(chalk.blue('\n📁 生成的文件:'))
    const { readdirSync, statSync } = await import('fs')
    function listFiles(dir, prefix = '') {
      const files = readdirSync(dir)
      files.forEach(file => {
        const fullPath = resolve(dir, file)
        const stats = statSync(fullPath)
        if (stats.isDirectory()) {
          console.log(chalk.gray(`${prefix}📁 ${file}/`))
          listFiles(fullPath, prefix + '  ')
        } else {
          console.log(chalk.cyan(`${prefix}📄 ${file}`))
        }
      })
    }
    listFiles('dist')
  } catch (error) {
    console.error(chalk.red('\n❌ 构建失败：'), error)
    process.exit(1)
  }
}

buildLib()
