#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const [,, rawName] = process.argv;
if (!rawName) {
  console.error('❌ Vui lòng truyền tên module (ví dụ: StudentProfile)');
  console.log('📖 Cách sử dụng: node nestbase.js StudentProfile');
  process.exit(1);
}

// Helper function để chuyển PascalCase sang kebab-case
function toKebabCase(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

// Helper function để chuyển PascalCase sang camelCase
function toCamelCase(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

// Helper function để tạo plural form
function toPlural(str) {
  const kebabCase = toKebabCase(str);
  if (kebabCase.endsWith('y')) {
    return kebabCase.slice(0, -1) + 'ies';
  } else if (kebabCase.endsWith('s') || kebabCase.endsWith('sh') || kebabCase.endsWith('ch') || kebabCase.endsWith('x') || kebabCase.endsWith('z')) {
    return kebabCase + 'es';
  } else {
    return kebabCase + 's';
  }
}

// Helper function để chèn dòng mới trước dấu ngoặc đóng (ngoặc nhọn hoặc vuông) của một danh sách/mảng
function insertBeforeClosingBrace(content, index, insertStr) {
  const beforeBrace = content.slice(0, index);
  const afterBrace = content.slice(index);
  
  const lastNewlineIndex = beforeBrace.lastIndexOf('\n');
  const indentation = lastNewlineIndex !== -1 ? beforeBrace.slice(lastNewlineIndex + 1) : '';
  const cleanBefore = beforeBrace.slice(0, lastNewlineIndex + 1);
  const itemIndentation = indentation + '  ';
  
  return cleanBefore + itemIndentation + insertStr + '\n' + indentation + afterBrace;
}

const Name = rawName; // PascalCase: StudentProfile
const name = toCamelCase(rawName); // camelCase: studentProfile
const kebabName = toKebabCase(rawName); // kebab-case: student-profile
const kebabNames = toPlural(rawName); // plural kebab-case: student-profiles

const basePath = path.join(__dirname, 'src', 'modules', kebabName);

// Tạo thư mục với kebab-case
console.log(`📁 Tạo thư mục cho module ${Name} tại: src/modules/${kebabName}`);
fs.mkdirSync(basePath + '/controllers', { recursive: true });
fs.mkdirSync(basePath + '/services', { recursive: true });
fs.mkdirSync(basePath + '/repositories', { recursive: true });
fs.mkdirSync(basePath + '/entities', { recursive: true });
fs.mkdirSync(basePath + '/models', { recursive: true });
fs.mkdirSync(basePath + '/dto', { recursive: true });

// Entity với kebab-case filename
console.log(`📄 Tạo ${kebabName}.entity.ts...`);
fs.writeFileSync(`${basePath}/entities/${kebabName}.entity.ts`, 
`import { BaseEntity } from '@Common/interfaces/base-entity.interface';
import { StrObjectId } from "@/common/constants/base.constant";

export class ${Name} implements BaseEntity {
  @StrObjectId()
  _id: string;
}
`);

// Model với kebab-case filename
console.log(`📄 Tạo ${kebabName}.model.ts...`);
fs.writeFileSync(`${basePath}/models/${kebabName}.model.ts`, 
`import { Table, Model } from 'sequelize-typescript';
import { ${Name} } from "../entities/${kebabName}.entity";
import { EntityTable } from '@Common/constants/entity.constant';
import { StrObjectId } from "@Common/constants/base.constant";

@Table({
  tableName: EntityTable.${kebabName.toUpperCase().replace(/-/g, '_')},
})
export class ${Name}Model extends Model implements ${Name} {
  @StrObjectId()
  _id: string;
}
`);

// Repository với kebab-case filename
console.log(`📄 Tạo ${kebabName}.repository.ts...`);
fs.writeFileSync(`${basePath}/repositories/${kebabName}.repository.ts`, 
`import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@Base/base.repository';
import { ${Name} } from '../entities/${kebabName}.entity';
import { ${Name}Model } from '../models/${kebabName}.model';
@Injectable()
export class ${Name}Repository extends BaseRepository<${Name}> {
  constructor() {
    super(${Name}Model);
  }

}
`);

// Service với kebab-case filename
console.log(`📄 Tạo ${kebabName}.service.ts...`);
fs.writeFileSync(`${basePath}/services/${kebabName}.service.ts`, 
`import { Injectable } from '@nestjs/common';
import { BaseService } from '@Base/base.service';
import { ${Name} } from '../entities/${kebabName}.entity';
import { ${Name}Repository } from '../repositories/${kebabName}.repository';
import { Create${Name}Dto } from '../dto/create-${kebabName}.dto';
import { Update${Name}Dto } from '../dto/update-${kebabName}.dto';

@Injectable()
export class ${Name}Service extends BaseService<${Name}> {
  constructor(private readonly ${name}Repository: ${Name}Repository) {
    super(${name}Repository);
  }

}
`);

// Controller với kebab-case filename
console.log(`📄 Tạo ${kebabName}.controller.ts...`);
fs.writeFileSync(`${basePath}/controllers/${kebabName}.controller.ts`, 
`import { 
  Controller, 
  Query,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ${Name}Service } from '../services/${kebabName}.service';
import { Create${Name}Dto } from '../dto/create-${kebabName}.dto';
import { Update${Name}Dto } from '../dto/update-${kebabName}.dto';
import { Auth } from '@Decorators/auth.decorator';
import { Public } from '@Decorators/public.decorator';
import { ApiError } from '@Exceptions/api-error';

@Controller('${kebabName}')
export class ${Name}Controller {
  constructor(private readonly ${name}Service: ${Name}Service) {}

}
`);

// DTOs với kebab-case filename
console.log(`📄 Tạo create-${kebabName}.dto.ts...`);
fs.writeFileSync(`${basePath}/dto/create-${kebabName}.dto.ts`, 
`import { OmitType } from '@nestjs/swagger';
import { ${Name} } from '../entities/${kebabName}.entity';

export class Create${Name}Dto extends OmitType(${Name}, ['_id']) {
  
}
`);

console.log(`📄 Tạo update-${kebabName}.dto.ts...`);
fs.writeFileSync(`${basePath}/dto/update-${kebabName}.dto.ts`, 
`import { PartialType } from '@nestjs/swagger';
import { Create${Name}Dto } from './create-${kebabName}.dto';

export class Update${Name}Dto extends PartialType(Create${Name}Dto) {}
`);

// Module với kebab-case filename
console.log(`📄 Tạo ${kebabName}.module.ts...`);
fs.writeFileSync(`${basePath}/${kebabName}.module.ts`, 
`import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ${Name}Model } from './models/${kebabName}.model';
import { ${Name}Controller } from './controllers/${kebabName}.controller';
import { ${Name}Service } from './services/${kebabName}.service';
import { ${Name}Repository } from './repositories/${kebabName}.repository';

@Module({
  imports: [],
  controllers: [${Name}Controller],
  providers: [${Name}Service, ${Name}Repository],
  exports: [${Name}Service, ${Name}Repository],
})
export class ${Name}Module {}
`);

// -------------------------------------------------------------
// TỰ ĐỘNG ĐĂNG KÝ VÀO CÁC FILE HỆ THỐNG
// -------------------------------------------------------------
console.log(`\n🔗 Bắt đầu đăng ký ${Name} vào hệ thống...`);

// 1. Thêm vào src/common/constants/entity.constant.ts
const entityConstantPath = path.join(__dirname, 'src', 'common', 'constants', 'entity.constant.ts');
if (fs.existsSync(entityConstantPath)) {
  let content = fs.readFileSync(entityConstantPath, 'utf8');
  const constantName = kebabName.toUpperCase().replace(/-/g, '_');
  const tableName = kebabNames.replace(/-/g, '_');
  
  if (!content.includes(`${constantName}:`)) {
    const lastBraceIndex = content.lastIndexOf('}');
    if (lastBraceIndex !== -1) {
      content = insertBeforeClosingBrace(content, lastBraceIndex, `${constantName}: '${tableName}',`);
      fs.writeFileSync(entityConstantPath, content, 'utf8');
      console.log(`   ✅ Đã thêm Table Name: '${tableName}' vào entity.constant.ts`);
    }
  } else {
    console.log(`   ℹ️ ${constantName} đã tồn tại trong entity.constant.ts`);
  }
}

// 2. Thêm vào src/modules/repository/common/sequelize-model.ts
const sequelizeModelPath = path.join(__dirname, 'src', 'modules', 'repository', 'common', 'sequelize-model.ts');
if (fs.existsSync(sequelizeModelPath)) {
  let content = fs.readFileSync(sequelizeModelPath, 'utf8');
  const modelName = `${Name}Model`;
  const importLine = `import { ${modelName} } from '@/modules/${kebabName}/models/${kebabName}.model';`;
  
  if (!content.includes(modelName)) {
    const lines = content.split('\n');
    let lastImportIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ')) {
        lastImportIndex = i;
      }
    }
    
    if (lastImportIndex !== -1) {
      lines.splice(lastImportIndex + 1, 0, importLine);
    } else {
      lines.unshift(importLine);
    }
    
    content = lines.join('\n');
    
    const arrayStartIndex = content.indexOf('export const SequelizeModel');
    if (arrayStartIndex !== -1) {
      const closingBraceIndex = content.indexOf('];', arrayStartIndex);
      if (closingBraceIndex !== -1) {
        content = insertBeforeClosingBrace(content, closingBraceIndex, `${modelName},`);
      }
    }
    
    fs.writeFileSync(sequelizeModelPath, content, 'utf8');
    console.log(`   ✅ Đã đăng ký Model: ${modelName} trong sequelize-model.ts`);
  } else {
    console.log(`   ℹ️ ${modelName} đã tồn tại trong sequelize-model.ts`);
  }
}

// 3. Thêm vào src/app.module.ts
const appModulePath = path.join(__dirname, 'src', 'app.module.ts');
if (fs.existsSync(appModulePath)) {
  let content = fs.readFileSync(appModulePath, 'utf8');
  const moduleName = `${Name}Module`;
  const importLine = `import { ${moduleName} } from './modules/${kebabName}/${kebabName}.module';`;
  
  if (!content.includes(moduleName)) {
    const lines = content.split('\n');
    let lastImportIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ')) {
        lastImportIndex = i;
      }
    }
    
    if (lastImportIndex !== -1) {
      lines.splice(lastImportIndex + 1, 0, importLine);
    } else {
      lines.unshift(importLine);
    }
    
    content = lines.join('\n');
    
    const moduleDecoratorIndex = content.indexOf('@Module({');
    if (moduleDecoratorIndex !== -1) {
      const importsStartIndex = content.indexOf('imports: [', moduleDecoratorIndex);
      if (importsStartIndex !== -1) {
        let bracketCount = 1;
        let index = importsStartIndex + 10;
        while (bracketCount > 0 && index < content.length) {
          if (content[index] === '[') {
            bracketCount++;
          } else if (content[index] === ']') {
            bracketCount--;
          }
          if (bracketCount === 0) {
            break;
          }
          index++;
        }
        
        if (bracketCount === 0) {
          content = insertBeforeClosingBrace(content, index, `${moduleName},`);
        }
      }
    }
    
    fs.writeFileSync(appModulePath, content, 'utf8');
    console.log(`   ✅ Đã đăng ký Module: ${moduleName} trong app.module.ts`);
  } else {
    console.log(`   ℹ️ ${moduleName} đã tồn tại trong app.module.ts`);
  }
}

console.log(`\n✅ Đã tạo và đăng ký thành công base module cho ${Name}`);
console.log(`📋 Cấu trúc được tạo:`);
console.log(`   📁 src/modules/${kebabName}/`);
console.log(`   ├── 📁 controllers/`);
console.log(`   │   └── 📄 ${kebabName}.controller.ts`);
console.log(`   ├── 📁 services/`);
console.log(`   │   └── 📄 ${kebabName}.service.ts`);
console.log(`   ├── 📁 repositories/`);
console.log(`   │   └── 📄 ${kebabName}.repository.ts`);
console.log(`   ├── 📁 entities/`);
console.log(`   │   └── 📄 ${kebabName}.entity.ts`);
console.log(`   ├── 📁 dto/`);
console.log(`   │   ├── 📄 create-${kebabName}.dto.ts`);
console.log(`   │   └── 📄 update-${kebabName}.dto.ts`);
console.log(`   └── 📄 ${kebabName}.module.ts`);
console.log(`\n🔧 Bước tiếp theo:`);
console.log(`   1. Chỉnh sửa entity theo nhu cầu cụ thể`);
console.log(`   2. Cập nhật DTOs validation rules`);
console.log(`   3. Thêm business logic vào service`);
console.log(`\n📊 Database table: ${kebabNames.replace(/-/g, '_')}`);
console.log(`🌐 API endpoints: /api/${kebabNames}`);

