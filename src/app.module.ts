import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'db/data-source';
import { CurrentUserMiddleware } from './utils/middlewares/current-user.middleware';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CartModule } from './modules/cart/cart.module';
import { MetadataModule } from './modules/metadata/metadata.module';
import { AuthorsModule } from './modules/authors/authors.module';
import { PublisherModule } from './modules/publisher/publisher.module';
import { MailModule } from './mail/mail.module';
import { PostModule } from './modules/post/post.module';
import { CommentModule } from './modules/comment/comment.module';
import { LikesModule } from './modules/likes/likes.module';
import { ChatGateway } from './gateways/chat.gateway';
import { MessagesModule } from './modules/messages/messages.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    MailModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    ReviewsModule,
    OrdersModule,
    CartModule,
    MetadataModule,
    AuthorsModule,
    PublisherModule,
    PostModule,
    CommentModule,
    LikesModule,
    MessagesModule,
  ],
  controllers: [],
  providers: [ChatGateway],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CurrentUserMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}

